-- Enable the pg_net extension if not already enabled (should already be enabled from 08_partner_application_webhook.sql)
-- This is needed to make HTTP requests from the database
create extension if not exists pg_net with schema extensions;

-- Function to notify when partner application status changes
create or replace function notify_partner_application_status_change()
returns trigger as $$
declare
  webhook_url text;
  payload jsonb;
begin
  -- Only trigger webhook if status has changed to 'approved' or 'rejected'
  if (old.status is distinct from new.status) and (new.status in ('approved', 'rejected')) then
    webhook_url := 'https://playcircleapp.com/api/webhooks/partner-application-status';

    payload := jsonb_build_object(
      'type', 'partner_application.status_changed',
      'record', jsonb_build_object(
        'id', new.id,
        'company_name', new.company_name,
        'email', new.email,
        'contact_person', new.contact_person,
        'business_type', new.business_type,
        'status', new.status,
        'previous_status', old.status,
        'reviewed_at', new.reviewed_at,
        'rejection_reason', new.rejection_reason
      )
    );

    perform net.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := payload
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for status changes
-- Note: This is an AFTER UPDATE trigger that runs after the existing BEFORE UPDATE trigger
-- (on_application_status_change) which handles the business logic of approving/rejecting applications
drop trigger if exists on_partner_application_status_webhook on partner_applications;
create trigger on_partner_application_status_webhook
  after update on partner_applications
  for each row
  execute function notify_partner_application_status_change();

-- Add comment to document the trigger
comment on trigger on_partner_application_status_webhook on partner_applications is
  'Sends webhook notification when partner application status changes to approved or rejected. Runs after on_application_status_change trigger.';
