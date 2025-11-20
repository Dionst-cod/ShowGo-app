/*
  # Reset events ID sequence

  1. Changes
    - Resets the events ID sequence to the current maximum ID
    - Ensures future event IDs continue sequentially from the highest existing ID
  
  2. Notes
    - This fixes gaps in ID numbering caused by deleted records
    - Only affects new events created after this migration
    - Existing event IDs remain unchanged
*/

SELECT setval('events_new_id_seq', (SELECT COALESCE(MAX(id), 0) FROM events));
