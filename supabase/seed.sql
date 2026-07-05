-- MeKasa seed — mirrors src/data/fixtures.ts. Run after schema.sql.
-- Safe to re-run: clears and reinserts the demo content.

delete from public.messages;
delete from public.players;
delete from public.circles;
delete from public.notifications;

insert into public.circles
  (id, sport, sport_label, beach_id, beach_name, court, level_label, capacity, state, is_open, host_id, host_name, start_label, distance_label, host_note, lat, lng)
values
  ('frishman', 'footvolley', 'פוצ''יוולי', 'frishman', 'חוף פרישמן', 'מגרש 2, ליד המציל', 'בינוניים', 4, 'missing', true, 'u-omer', 'עומר', 'התחיל לפני 20 דק''', '300 מ'' ממך', '"מביאים כדור, תביאו מים" — עומר', 32.0809, 34.767),
  ('gordon', 'altinha', 'אלטינה', 'gordon', 'חוף גורדון', 'ליד המים', 'פתוח לכולם', 4, 'live', true, 'p1', 'אסף', 'משחק חי', '650 מ''', null, 32.0846, 34.7686),
  ('metzitzim', 'volleyball', 'כדורעף חופים', 'metzitzim', 'מצודת הים', 'מגרש 1', 'מקצוענים', 6, 'live', true, 'q1', 'דור', 'משחק חי', '1.8 ק"מ', null, 32.0966, 34.7724),
  ('own-gordon', 'altinha', 'אלטינה', 'gordon', 'חוף גורדון', 'ליד המים', 'פתוח לכולם', 6, 'scheduled', true, 'u-guy', 'גיא', 'ראשון 18:00', '650 מ''', null, 32.0846, 34.7686);

insert into public.players (id, circle_id, user_id, name, avatar_initial, avatar_color, position) values
  ('frishman:u-omer',   'frishman',   'u-omer',   'עומר',    'ע', '#0E4F5E', 0),
  ('frishman:u-daniel', 'frishman',   'u-daniel', 'דניאל',   'ד', '#14B8A8', 1),
  ('frishman:u-noa',    'frishman',   'u-noa',    'נועה',    'נ', '#E8A13C', 2),
  ('gordon:p1',         'gordon',     'p1',       'אסף',     'א', '#7A6FB8', 0),
  ('gordon:p2',         'gordon',     'p2',       'טל',      'ט', '#4E9B8F', 1),
  ('gordon:p3',         'gordon',     'p3',       'יובל',    'י', '#5E7078', 2),
  ('gordon:p4',         'gordon',     'p4',       'שי',      'ש', '#14B8A8', 3),
  ('metzitzim:q1',      'metzitzim',  'q1',       'דור',     'ד', '#E8A13C', 0),
  ('metzitzim:q2',      'metzitzim',  'q2',       'ניב',     'נ', '#7A6FB8', 1),
  ('metzitzim:q3',      'metzitzim',  'q3',       'ליה',     'ל', '#4E9B8F', 2),
  ('metzitzim:q4',      'metzitzim',  'q4',       'עדן',     'ע', '#5E7078', 3),
  ('metzitzim:q5',      'metzitzim',  'q5',       'יואב',    'י', '#0E4F5E', 4),
  ('metzitzim:q6',      'metzitzim',  'q6',       'בן',      'ב', '#14B8A8', 5),
  ('own-gordon:u-guy',  'own-gordon', 'u-guy',    'גיא לוי', 'ג', '#0E4F5E', 0),
  ('own-gordon:u-daniel','own-gordon','u-daniel', 'דניאל',   'ד', '#14B8A8', 1);

insert into public.messages (id, circle_id, kind, sender_id, sender_name, sender_color, avatar_letter, avatar_color, text, time_label) values
  ('m1', 'frishman', 'join', null, null, null, null, null, 'נועה הצטרפה למעגל · 17:42', '17:42'),
  ('m2', 'frishman', 'in', 'u-omer', 'עומר · מארח', '#E85413', 'ע', '#0E4F5E', 'חבר''ה אנחנו במגרש 2, ליד סוכת המציל. הרשת כבר למעלה 💪', '17:44'),
  ('m3', 'frishman', 'in', 'u-noa', 'נועה', '#E8A13C', 'נ', '#E8A13C', 'מביאה כדור נוסף ליתר ביטחון', '17:46'),
  ('m4', 'frishman', 'out', null, null, null, null, null, 'יוצא עכשיו, 5 דקות ואני שם', '17:47'),
  ('m6', 'frishman', 'in', 'u-daniel', 'דניאל', '#0E7A6E', 'ד', '#14B8A8', 'מישהו מביא רמקול? 🎵', '17:49');

insert into public.notifications (id, kind, "group", title, body, time_label, unread) values
  ('n1', 'hot', 'now', 'נפתח מעגל בחוף פרישמן — חסר שחקן!', 'פוצ''יוולי · בינוניים · 300 מ'' ממך', 'לפני 2 דק''', true),
  ('n2', 'social', 'now', 'דניאל הצטרף למעגל שלך', 'אלטינה · חוף גורדון · ראשון 18:00', 'לפני 14 דק''', true),
  ('n3', 'tournament', 'today', 'מחר: גביע הילטון של הקיץ', 'שבת 9:00 · אתם רשומים · אל תאחרו', '9:20', false),
  ('n4', 'summary', 'today', 'המעגל בגורדון נסגר', 'שיחקתם 2.5 שעות · דרג את המשחק', '8:05', false);
