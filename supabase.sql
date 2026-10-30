-- Run once in Supabase: SQL Editor > New query. Replace amsharjk@gmail.com (2 places).
create table site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table site_content enable row level security;
create policy "anyone can read" on site_content for select using (true);
create policy "admin can insert" on site_content for insert to authenticated
  with check (auth.jwt()->>'email' = 'amsharjk@gmail.com');
create policy "admin can update" on site_content for update to authenticated
  using (auth.jwt()->>'email' = 'amsharjk@gmail.com')
  with check (auth.jwt()->>'email' = 'amsharjk@gmail.com');

-- Live chat (temporary: hidden after 2 days and deleted automatically)
-- Photos and voice messages are stored inside the message row, so they are deleted with it.
create table chat_messages (
  id bigserial primary key,
  session text not null check (length(session) between 8 and 64),
  sender text not null check (sender in ('student','admin')),
  body text not null default '' check (length(body) <= 600),
  media_type text check (media_type in ('image','audio')),
  media text check (length(media) <= 400000),
  created_at timestamptz default now(),
  check (body <> '' or media is not null)
);
alter table chat_messages enable row level security;
create policy "student reads own chat" on chat_messages for select to anon
  using (session = (current_setting('request.headers', true)::json->>'x-session') and created_at > now() - interval '2 days');
create policy "student sends text" on chat_messages for insert to anon
  with check (sender = 'student' and media is null and session = (current_setting('request.headers', true)::json->>'x-session'));
create policy "admin manages chat" on chat_messages for all to authenticated
  using (auth.jwt()->>'email' = 'amsharjk@gmail.com') with check (auth.jwt()->>'email' = 'amsharjk@gmail.com');

-- Automatic deletion: every new message removes chats older than 2 days (no extension needed).
create or replace function purge_old_chat() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from chat_messages where created_at < now() - interval '2 days';
  return null;
end $$;
create trigger chat_purge after insert on chat_messages
  for each statement execute function purge_old_chat();
