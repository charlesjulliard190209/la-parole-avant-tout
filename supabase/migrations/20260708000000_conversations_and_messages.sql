-- Story 1.1: tables Conversation et Message.
-- RecoveryAttempt n'est volontairement pas créée ici (nécessaire seulement à
-- partir de la Story 1.5, cf. AD-9 et epics.md).

create extension if not exists pgcrypto;

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  -- nullable et absents tous les deux en mode éphémère (AD-5)
  session_token_hash text,
  recovery_code_hash text,
  is_ephemeral boolean not null default false,
  is_priority boolean not null default false,
  flagged_missed_danger boolean not null default false,
  -- null ou antérieur au dernier message élève = conversation non traitée (FR-5, FR-15)
  last_organizer_read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_type text not null check (sender_type in ('eleve', 'organisateur')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on messages (conversation_id);

-- AD-4 : deny-by-default. RLS activé, aucune policy pour anon/authenticated —
-- seule la clé service (qui contourne RLS) accède à ces tables.
alter table conversations enable row level security;
alter table messages enable row level security;
