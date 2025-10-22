# Contact Form - Quick Start Guide

## Prerequisites Checklist

- [x] Contact form UI component exists at [components/contact-form.tsx](components/contact-form.tsx)
- [x] API endpoint created at [app/api/contact/route.ts](app/api/contact/route.ts)
- [x] Database migration ready at [sql/create_support_tickets.sql](sql/create_support_tickets.sql)
- [x] SMTP configuration already set up in `.env.local`
- [x] Environment variables added for support emails

## Quick Setup (3 Steps)

### Step 1: Add Service Role Key

Edit `.env.local` and replace `your_service_role_key_here` with your actual Supabase service role key:

1. Go to your Supabase Dashboard
2. Navigate to: **Settings** > **API**
3. Copy the `service_role` key (it's a secret key)
4. Update line 4 in `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Your actual key here
```

### Step 2: Run Database Migration

Run the SQL migration file in your Supabase database:

**Option A - Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of [sql/create_support_tickets.sql](sql/create_support_tickets.sql)
5. Click **Run**

**Option B - Supabase CLI (if installed):**
```bash
supabase db push sql/create_support_tickets.sql
```

### Step 3: Test the Form

1. Start your development server (if not already running):
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/contact`

3. Fill out and submit the test form

4. Verify:
   - ✅ Success message appears on the page
   - ✅ Confirmation email arrives in the email you entered
   - ✅ Support notification email arrives at: `bluebillshtml@outlook.com`

## What's Already Configured

### Environment Variables Set
- ✅ `SMTP_HOST` - smtp.hostinger.com
- ✅ `SMTP_PORT` - 465
- ✅ `SMTP_USER` - no-reply@playcircleapp.com
- ✅ `SMTP_PASS` - (configured)
- ✅ `SMTP_ALIAS_SUPPORT` - support@playcircleapp.com
- ✅ `SMTP_SUPPORT_EMAIL` - bluebillshtml@outlook.com

### Form Features
- ✅ Phone number auto-formatting (305-555-1234)
- ✅ Email validation
- ✅ Required field validation
- ✅ Loading states during submission
- ✅ Success/error messages
- ✅ Form auto-resets after successful submission

### Email Notifications
- ✅ User receives confirmation email with reference ID
- ✅ Support team receives detailed ticket notification
- ✅ Support team email includes reply-to user's email

### Database Features
- ✅ Auto-expiry after 7 days
- ✅ Indexed for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Helper function for manual cleanup

## Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | Text | Yes | - |
| Last Name | Text | Yes | - |
| Email | Email | Yes | Validated format |
| Phone | Tel | Yes | Auto-formats to 305-555-1234 |
| How can we help? | Select | Yes | partnership, general_inquiry, feedback, other |
| Message | Textarea | Yes | 5 rows |

## Help Type Options

- **Partnership** - For partnership inquiries
- **General Inquiry** - General questions
- **Feedback** - User feedback
- **Other** - Everything else

## Troubleshooting

### "Missing environment variables" error
- Make sure you added the `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Restart your development server after adding it

### Emails not sending
- Check that `SMTP_ALIAS_SUPPORT` is allowed by your SMTP provider
- Verify all SMTP settings in `.env.local`
- Check server console logs for detailed error messages

### Database errors
- Ensure you ran the migration successfully
- Check Supabase logs for specific error messages
- Verify your service role key has proper permissions

### Form validation errors
- Open browser developer tools console
- Check for any JavaScript errors
- Ensure all form fields have proper `name` attributes

## Next Steps

Once everything is working:

1. **Test with real data** - Submit actual inquiries
2. **Monitor emails** - Check both confirmation and support emails
3. **Review database** - Check tickets in Supabase dashboard
4. **Set up cleanup** - Consider scheduling automated cleanup (see [CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md))

## Support

For detailed information, see [CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md)

Current support email destination: `bluebillshtml@outlook.com`
