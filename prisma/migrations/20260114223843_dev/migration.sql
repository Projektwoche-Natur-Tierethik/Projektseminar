-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_participants" (
    "p_id" TEXT NOT NULL PRIMARY KEY,
    "u_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "main_conclusion" TEXT,
    "continue_button" BOOLEAN NOT NULL DEFAULT false,
    "move_on_button" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "participants_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "participants_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_participants" ("admin", "continue_button", "d_id", "main_conclusion", "p_id", "u_id") SELECT "admin", "continue_button", "d_id", "main_conclusion", "p_id", "u_id" FROM "participants";
DROP TABLE "participants";
ALTER TABLE "new_participants" RENAME TO "participants";
CREATE UNIQUE INDEX "participants_u_id_d_id_key" ON "participants"("u_id", "d_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
