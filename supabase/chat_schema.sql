-- TattooAli — Chat no Supabase (rodar no SQL Editor do projeto Supabase).
-- Depois: Database → Replication → habilite realtime para public.chat_messages (ou use o comando abaixo).
--
-- Variáveis nos apps:
--   Web:   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
--   Expo:  EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
--
-- O JWT de login já é o access_token do Supabase; RLS usa auth.uid().

create table if not exists public.chat_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Usuário',
  role text,
  app_user_id int unique,
  updated_at timestamptz not null default now()
);

create index if not exists chat_profiles_app_user_id_idx on public.chat_profiles (app_user_id);

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  p_a uuid not null references auth.users (id) on delete cascade,
  p_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint chat_conversations_ordered check (p_a < p_b),
  constraint chat_conversations_unique_pair unique (p_a, p_b)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_len check (char_length(body) > 0 and char_length(body) <= 5000)
);

create index if not exists chat_messages_conv_created_idx
  on public.chat_messages (conversation_id, created_at desc);

alter table public.chat_profiles enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists chat_profiles_select_authenticated on public.chat_profiles;
create policy chat_profiles_select_authenticated
  on public.chat_profiles for select
  to authenticated
  using (true);

drop policy if exists chat_profiles_insert_own on public.chat_profiles;
create policy chat_profiles_insert_own
  on public.chat_profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists chat_profiles_update_own on public.chat_profiles;
create policy chat_profiles_update_own
  on public.chat_profiles for update
  to authenticated
  using (id = auth.uid());

drop policy if exists chat_conversations_select_participant on public.chat_conversations;
create policy chat_conversations_select_participant
  on public.chat_conversations for select
  to authenticated
  using (auth.uid() = p_a or auth.uid() = p_b);

drop policy if exists chat_messages_select_participant on public.chat_messages;
create policy chat_messages_select_participant
  on public.chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id
        and (auth.uid() = c.p_a or auth.uid() = c.p_b)
    )
  );

drop policy if exists chat_messages_insert_participant on public.chat_messages;
create policy chat_messages_insert_participant
  on public.chat_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chat_conversations c
      where c.id = conversation_id
        and (auth.uid() = c.p_a or auth.uid() = c.p_b)
    )
  );

revoke insert on public.chat_conversations from authenticated;

create or replace function public.get_or_create_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid;
  low uuid;
  high uuid;
  conv uuid;
begin
  me := auth.uid();
  if me is null then
    raise exception 'not authenticated';
  end if;
  if other_user_id = me then
    raise exception 'invalid peer';
  end if;
  if me::text < other_user_id::text then
    low := me;
    high := other_user_id;
  else
    low := other_user_id;
    high := me;
  end if;

  insert into public.chat_conversations (p_a, p_b)
  values (low, high)
  on conflict (p_a, p_b) do nothing
  returning id into conv;

  if conv is null then
    select id into conv from public.chat_conversations where p_a = low and p_b = high;
  end if;

  return conv;
end;
$$;

grant execute on function public.get_or_create_conversation(uuid) to authenticated;

create or replace function public.list_my_chat_threads()
returns table (
  conversation_id uuid,
  peer_id uuid,
  peer_app_user_id int,
  peer_name text,
  last_body text,
  last_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with my_conv as (
    select c.id, c.p_a, c.p_b
    from public.chat_conversations c
    where c.p_a = auth.uid() or c.p_b = auth.uid()
  ),
  with_peer as (
    select
      mc.id as conv_id,
      case when mc.p_a = auth.uid() then mc.p_b else mc.p_a end as peer_id
    from my_conv mc
  ),
  last_msg as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      m.body,
      m.created_at
    from public.chat_messages m
    inner join my_conv c on c.id = m.conversation_id
    order by m.conversation_id, m.created_at desc
  )
  select
    w.conv_id as conversation_id,
    w.peer_id,
    p.app_user_id as peer_app_user_id,
    coalesce(p.display_name, 'Usuário')::text as peer_name,
    lm.body as last_body,
    lm.created_at as last_at
  from with_peer w
  left join public.chat_profiles p on p.id = w.peer_id
  left join last_msg lm on lm.conversation_id = w.conv_id
  order by lm.created_at desc nulls last;
$$;

grant execute on function public.list_my_chat_threads() to authenticated;

grant select, insert, update on public.chat_profiles to authenticated;
grant select on public.chat_conversations to authenticated;
grant select, insert on public.chat_messages to authenticated;

-- Realtime: no painel Supabase → Database → Publications → supabase_realtime → inclua chat_messages
-- ou (se ainda não estiver na publication):
-- alter publication supabase_realtime add table public.chat_messages;
