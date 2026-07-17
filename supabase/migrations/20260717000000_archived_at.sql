-- Archivage des conversations côté Organisateur (admin v2) : null = active,
-- renseigné = rangée dans l'onglet « Archivées ». Distinct de
-- last_organizer_read_at (« lu ») : archiver est une action volontaire de
-- clôture, pas un simple accusé de lecture. Un nouveau message élève remet
-- archived_at à null (réouverture automatique, cf. envoyerMessage).
alter table conversations
  add column if not exists archived_at timestamptz;
