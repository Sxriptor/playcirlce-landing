# Contact Form & Support Tickets Setup Guide

This document outlines the implementation of the contact form feature with database storage and email notifications.

## Overview

The contact form allows visitors to submit support tickets which are:
- Stored in a `support_tickets` database table
- Automatically expire after 7 days
- Send email notifications to both the support team and the user

## Files Created/Modified

### Database
- **`sql/create_support_tickets.sql`** - Database migration for the support_tickets table

### API
- **`app/api/contact/route.ts`** - API endpoint for handling contact form submissions

### Components
- **`components/contact-form.tsx`** - Updated with full API integration and validation

## Database Schema

The `support_tickets` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `first_name` | text | User's first name |
| `last_name` | text | User's last name |
| `email` | text | User's email address |
| `phone` | text | User's phone number (formatted as 305-555-1234) |
| `help_type` | enum | Type of inquiry (partnership, general_inquiry, feedback, other) |
| `message` | text | User's message |
| `created_at` | timestamptz | When the ticket was created |
| `expires_at` | timestamptz | When the ticket expires (7 days from creation) |

## Setup Instructions

### 1. Run Database Migration

Run the SQL migration to create the `support_tickets` table:

```bash
# Using Supabase CLI
supabase db push sql/create_support_tickets.sql

# Or run directly in Supabase SQL Editor
# Copy and paste the contents of sql/create_support_tickets.sql
```

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SMTP Configuration (if not already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Support-specific email configuration
SMTP_ALIAS_SUPPORT=support@playcircleapp.com
SMTP_SUPPORT_EMAIL=your-support-team-email@playcircleapp.com
```

### 3. Email Configuration Notes

- **`SMTP_ALIAS_SUPPORT`**: The "from" address shown to users (e.g., support@playcircleapp.com)
- **`SMTP_SUPPORT_EMAIL`**: The actual email address where support tickets are sent to your team
- Ensure your SMTP provider allows sending from the alias address

## Features

### User Experience
1. **Form Validation**: Client-side and server-side validation
2. **Phone Formatting**: Automatic formatting to `305-555-1234` pattern
3. **Loading States**: Visual feedback during submission
4. **Success/Error Messages**: Clear feedback on submission status
5. **Form Reset**: Automatic form reset after successful submission

### Email Notifications

#### To Support Team
- Contains all ticket details including reference ID
- Includes user's contact information
- Shows formatted help type
- Provides ticket expiration notice

#### To User (Confirmation)
- Confirms receipt of their message
- Includes reference ID for their records
- Shows their submitted message
- Sets expectation for response time (24-48 hours)

### Data Management

#### Auto-Expiry
- Tickets automatically expire 7 days after creation
- Database includes helper function `delete_expired_support_tickets()`
- Can be scheduled with pg_cron or run manually

#### Manual Cleanup
To manually delete expired tickets:

```sql
SELECT delete_expired_support_tickets();
```

#### Setting Up Auto Cleanup (Optional)

If you have pg_cron enabled:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
SELECT cron.schedule(
  'delete-expired-support-tickets',
  '0 2 * * *',
  'SELECT delete_expired_support_tickets()'
);
```

## Row Level Security (RLS)

The table has RLS enabled with the following policies:

1. **Insert**: Anyone (anon/authenticated) can submit tickets
2. **Select**: Only authenticated admins can view tickets
3. **Delete**: Only authenticated admins can delete tickets

**Note**: The admin check assumes a `partners` table with an `is_admin` column. Modify the RLS policies based on your authentication setup.

## API Endpoint

### POST `/api/contact`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "305-555-1234",
  "helpType": "general_inquiry",
  "message": "I have a question about..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "ticketId": "uuid-here",
  "message": "Your message has been received. Check your email for confirmation."
}
```

**Error Response** (400/500):
```json
{
  "error": "Error message here",
  "details": "Additional details if available"
}
```

## Testing

### Test the Form
1. Navigate to `/contact` page
2. Fill out all required fields
3. Submit the form
4. Verify:
   - Success message appears
   - Confirmation email received
   - Support team receives notification
   - Record appears in database

### Test Database Entry
```sql
SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 10;
```

### Test Email Functionality
Check that both emails are sent:
1. User confirmation email
2. Support team notification email

## Troubleshooting

### Emails Not Sending
- Verify all SMTP environment variables are set correctly
- Check SMTP credentials and permissions
- Review server logs for detailed error messages
- Ensure your SMTP provider allows the alias address

### Database Errors
- Verify the migration ran successfully
- Check RLS policies match your authentication setup
- Ensure service role key has proper permissions

### Form Submission Errors
- Check browser console for client-side errors
- Review server logs at `/api/contact`
- Verify all required fields are being sent

## Future Enhancements

Potential improvements:
- Admin dashboard to view/manage tickets
- Email templates customization
- Ticket categorization and prioritization
- Integration with help desk systems
- Attachment support
- Real-time notifications
