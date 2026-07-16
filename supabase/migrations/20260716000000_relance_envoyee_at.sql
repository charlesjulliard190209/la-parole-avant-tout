-- Story 3.5: colonne pour éviter une relance dupliquée pour le même message
-- élève non lu — null signifie "jamais relancée", même convention que
-- last_organizer_read_at (comparaison contre le dernier message élève, pas
-- un simple booléen consommé une fois).

alter table conversations
  add column if not exists relance_envoyee_at timestamptz;
