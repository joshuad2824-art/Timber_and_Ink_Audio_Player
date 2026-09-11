-- Placeholder content, so the shell has something true to render before the
-- owner has put anything real in.
--
-- ON THE PHRASES BELOW. These are the three demo phrases from the design
-- handoff — "harbor light", "paper lantern", "kitchen radio" — and they are
-- printed in this repository's own README, which is public. They are hashed
-- here rather than stored in the clear, but hashing a phrase that is already
-- published protects nothing: treat these three records as open to anyone who
-- reads the repo.
--
-- That is acceptable only because the content is placeholder too — there is no
-- real audio behind any of it yet. Before real music goes in, every phrase has
-- to be reset from the desk (milestone 4), which rehashes with a fresh salt
-- and takes these values out of circulation.

INSERT INTO record (id, slug, artist_name, album_title, year, intro, phrase_hash, published, listed, position) VALUES
  ('rec_shadow_harbor', 'shadow-harbor', 'Shadow Harbor', 'Everything I didn''t say', 2026,
   'I wrote most of this late, after the house went quiet — one guitar, one microphone, and the things I kept not saying that year. It isn''t polished, and I''d rather it wasn''t. Play it in order if you have the time; it was written that way.',
   'scrypt$bMlzV8aNyzx6z07PuztN/Q==$Kr5aARocc3f2ho0PeSD7twj24wku00psxOGpLWhVu0g=', TRUE, TRUE, 0),

  ('rec_pale_ledger', 'pale-ledger', 'Pale Ledger', 'Slow county', 2025,
   'Seven songs about staying put — written on a back porch over one long summer, and recorded about as plainly as they were written.',
   'scrypt$oUqnzJIQt981NJYQYuMYCA==$2MA6xKKiPsCvv6ycXK6lBKzKLwR1rkUx1kG7AD4efns=', TRUE, TRUE, 1),

  ('rec_north_pasture', 'north-pasture', 'North Pasture', 'Winter light, held', 2024,
   'Eight quiet ones, cut in a barn between December and March. Headphones help — there''s a lot of room tone in here, and I left it in on purpose.',
   'scrypt$Sz8WI7+iPx3SvGqCaWIwbQ==$XN+DYhnSdVyWaN7PdVC5F4g05YW8W2Di0r3QqJBMzYQ=', TRUE, TRUE, 2);

INSERT INTO track (id, record_id, title, seconds, position) VALUES
  ('trk_sh1','rec_shadow_harbor','Harbor light',232,0),
  ('trk_sh2','rec_shadow_harbor','What the tide leaves',266,1),
  ('trk_sh3','rec_shadow_harbor','Low ceiling',194,2),
  ('trk_sh4','rec_shadow_harbor','Every porch on the block',303,3),
  ('trk_sh5','rec_shadow_harbor','Half a mile out',251,4),
  ('trk_sh6','rec_shadow_harbor','Cold frame',178,5),
  ('trk_sh7','rec_shadow_harbor','The long way home',287,6),
  ('trk_sh8','rec_shadow_harbor','Sleepless channel',215,7),
  ('trk_sh9','rec_shadow_harbor','Nothing to forgive',262,8),
  ('trk_sh10','rec_shadow_harbor','Everything I didn''t say',338,9),

  ('trk_pl1','rec_pale_ledger','Dry creek',221,0),
  ('trk_pl2','rec_pale_ledger','Ledger line',245,1),
  ('trk_pl3','rec_pale_ledger','The fairgrounds',192,2),
  ('trk_pl4','rec_pale_ledger','Borrowed truck',278,3),
  ('trk_pl5','rec_pale_ledger','Grain elevator',169,4),
  ('trk_pl6','rec_pale_ledger','What I owe you',301,5),
  ('trk_pl7','rec_pale_ledger','Slow county',262,6),

  ('trk_np1','rec_north_pasture','First frost',206,0),
  ('trk_np2','rec_north_pasture','Fence line',252,1),
  ('trk_np3','rec_north_pasture','Barn swallows',184,2),
  ('trk_np4','rec_north_pasture','Nobody''s road',284,3),
  ('trk_np5','rec_north_pasture','The long thaw',316,4),
  ('trk_np6','rec_north_pasture','Kerosene',213,5),
  ('trk_np7','rec_north_pasture','Held',178,6),
  ('trk_np8','rec_north_pasture','Winter light',291,7);

INSERT INTO site_text (id, eyebrow, title, intro, footer) VALUES
  (1, 'A small catalog', 'Recordings',
   'Every record here sits behind its own phrase. If I sent you one, it opens that artist and nothing else — no account, nothing to remember.',
   'more when they''re ready');
