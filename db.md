# Datenbank

## Ueberblick
- Datenbank: SQLite (lokal), via Prisma leicht auf externe DB (z. B. Postgres) umstellbar.
- Tabellen: users, discussion, participants, discussionpoints, conclusions_discussionpoints,
  likes_discussionpoint_conclusion, likes_discussion_conclusion, frame_of_values, user_values, values, norms.
- Loeschkaskaden: Wenn eine Diskussion geloescht wird, werden alle referenzierenden Eintraege automatisch entfernt.

## Tabellen (Kurzbeschreibung)
- users: Benutzerkonto (Name, Passwort-Hash, Salt).
- discussion: Diskussion (Code, Thema, Flags, aktueller Schritt).
- participants: Teilnehmer pro Diskussion (Admin-Flag, Hauptfazit, Continue-Status).
- discussionpoints: Diskussionspunkte je Diskussion.
- conclusions_discussionpoints: Schlussfolgerungen je Diskussionspunkt und User.
- likes_discussionpoint_conclusion: Likes fuer Diskussionspunkt-Schlussfolgerungen.
- likes_discussion_conclusion: Likes fuer Teilnehmer-Hauptfazit.
- frame_of_values: Werterahmen je Diskussion (Wert + Teil des Rahmens).
- user_values: Werteauswahl je User und Diskussion.
- values: Statische Werteliste.
- norms: Normen je User und Diskussion, basierend auf einem Wert aus dem Werterahmen.

## SQL (SQLite)
```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL
);

CREATE TABLE discussion (
  d_id TEXT PRIMARY KEY,
  d_code INTEGER NOT NULL UNIQUE,
  discussion_theme TEXT NOT NULL,
  inclusion_problem_part_of BOOLEAN NOT NULL DEFAULT 0,
  norms_part_of BOOLEAN NOT NULL DEFAULT 0,
  step INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE participants (
  p_id TEXT PRIMARY KEY,
  u_id TEXT NOT NULL,
  d_id TEXT NOT NULL,
  main_conclusion TEXT,
  continue_button BOOLEAN NOT NULL DEFAULT 0,
  admin BOOLEAN NOT NULL DEFAULT 0,
  UNIQUE (u_id, d_id),
  FOREIGN KEY (u_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (d_id) REFERENCES discussion(d_id) ON DELETE CASCADE
);

CREATE TABLE discussionpoints (
  dp_id TEXT PRIMARY KEY,
  written_by_u_id TEXT NOT NULL,
  d_id TEXT NOT NULL,
  marked_as_complete BOOLEAN NOT NULL DEFAULT 0,
  discussion_point TEXT NOT NULL,
  FOREIGN KEY (written_by_u_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (d_id) REFERENCES discussion(d_id) ON DELETE CASCADE
);

CREATE TABLE conclusions_discussionpoints (
  dp_conclusion_id TEXT PRIMARY KEY,
  dp_id TEXT NOT NULL,
  u_id TEXT NOT NULL,
  conclusion TEXT NOT NULL,
  UNIQUE (dp_id, u_id),
  FOREIGN KEY (dp_id) REFERENCES discussionpoints(dp_id) ON DELETE CASCADE,
  FOREIGN KEY (u_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE likes_discussionpoint_conclusion (
  user_likes_id TEXT NOT NULL,
  dp_conclusion_id TEXT NOT NULL,
  conclusion_written_by_user_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_likes_id, dp_conclusion_id, conclusion_written_by_user_id),
  FOREIGN KEY (user_likes_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (dp_conclusion_id) REFERENCES conclusions_discussionpoints(dp_conclusion_id) ON DELETE CASCADE,
  FOREIGN KEY (conclusion_written_by_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE likes_discussion_conclusion (
  user_likes_id TEXT NOT NULL,
  participants_conclusion_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_likes_id, participants_conclusion_id),
  FOREIGN KEY (user_likes_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (participants_conclusion_id) REFERENCES participants(p_id) ON DELETE CASCADE
);

CREATE TABLE values (
  v_id TEXT PRIMARY KEY,
  value TEXT NOT NULL UNIQUE
);

CREATE TABLE frame_of_values (
  d_id TEXT NOT NULL,
  v_id TEXT NOT NULL,
  part_of_frame BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (d_id, v_id),
  FOREIGN KEY (d_id) REFERENCES discussion(d_id) ON DELETE CASCADE,
  FOREIGN KEY (v_id) REFERENCES values(v_id) ON DELETE CASCADE
);

CREATE TABLE user_values (
  d_id TEXT NOT NULL,
  v_id TEXT NOT NULL,
  u_id TEXT NOT NULL,
  PRIMARY KEY (d_id, v_id, u_id),
  FOREIGN KEY (d_id) REFERENCES discussion(d_id) ON DELETE CASCADE,
  FOREIGN KEY (v_id) REFERENCES values(v_id) ON DELETE CASCADE,
  FOREIGN KEY (u_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE norms (
  n_id TEXT PRIMARY KEY,
  d_id TEXT NOT NULL,
  u_id TEXT NOT NULL,
  norm TEXT NOT NULL,
  based_on_value TEXT NOT NULL,
  part_of_frame BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (d_id) REFERENCES discussion(d_id) ON DELETE CASCADE,
  FOREIGN KEY (u_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (d_id, based_on_value) REFERENCES frame_of_values(d_id, v_id) ON DELETE CASCADE
);
```

## Hinweis zu Querys
- Zaehlerfunktionen (Counts) sind in der API implementiert:
  - Diskussionpunkte pro User in einer Diskussion.
  - Likes pro Diskussionspunkt-Schlussfolgerung.
  - Likes pro Teilnehmer-Hauptfazit.
  - Wertezaehlungen im Werterahmen.
