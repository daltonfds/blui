alter table public.whatsapp_connections
  add column if not exists display_name text,
  add column if not exists waba_id text,
  add column if not exists sender_sid text,
  add column if not exists twilio_subaccount_sid text,
  add column if not exists provider text not null default 'twilio',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_whatsapp_connections_twilio_from_status
  on public.whatsapp_connections (twilio_from, status);

create index if not exists idx_whatsapp_connections_subaccount
  on public.whatsapp_connections (twilio_subaccount_sid);

create index if not exists idx_whatsapp_connections_waba
  on public.whatsapp_connections (waba_id);

create index if not exists idx_whatsapp_connections_sender
  on public.whatsapp_connections (sender_sid);
