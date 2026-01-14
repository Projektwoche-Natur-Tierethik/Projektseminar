/*
  Warnings:

  - You are about to drop the `values` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `frame_of_values` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `v_id` on the `frame_of_values` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `based_on_value` on the `norms` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `user_values` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `v_id` on the `user_values` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- DropIndex
DROP INDEX "values_value_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "values";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_discussion" (
    "d_id" TEXT NOT NULL PRIMARY KEY,
    "d_code" INTEGER NOT NULL,
    "discussion_theme" TEXT NOT NULL,
    "inclusion_problem_part_of" BOOLEAN NOT NULL DEFAULT false,
    "norms_part_of" BOOLEAN NOT NULL DEFAULT false,
    "values_selection_count" INTEGER NOT NULL DEFAULT 10,
    "questions_per_participant" INTEGER NOT NULL DEFAULT 5,
    "step" INTEGER NOT NULL DEFAULT 0,
    "current_discussion_point_id" TEXT,
    CONSTRAINT "discussion_current_discussion_point_id_fkey" FOREIGN KEY ("current_discussion_point_id") REFERENCES "discussionpoints" ("dp_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_discussion" ("d_code", "d_id", "discussion_theme", "inclusion_problem_part_of", "norms_part_of", "questions_per_participant", "step", "values_selection_count") SELECT "d_code", "d_id", "discussion_theme", "inclusion_problem_part_of", "norms_part_of", "questions_per_participant", "step", "values_selection_count" FROM "discussion";
DROP TABLE "discussion";
ALTER TABLE "new_discussion" RENAME TO "discussion";
CREATE UNIQUE INDEX "discussion_d_code_key" ON "discussion"("d_code");
CREATE UNIQUE INDEX "discussion_current_discussion_point_id_key" ON "discussion"("current_discussion_point_id");
CREATE TABLE "new_frame_of_values" (
    "d_id" TEXT NOT NULL,
    "v_id" INTEGER NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("d_id", "v_id"),
    CONSTRAINT "frame_of_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_frame_of_values" ("d_id", "part_of_frame", "v_id") SELECT "d_id", "part_of_frame", "v_id" FROM "frame_of_values";
DROP TABLE "frame_of_values";
ALTER TABLE "new_frame_of_values" RENAME TO "frame_of_values";
CREATE TABLE "new_norms" (
    "n_id" TEXT NOT NULL PRIMARY KEY,
    "d_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "norm" TEXT NOT NULL,
    "based_on_value" INTEGER NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "norms_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "norms_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "norms_d_id_based_on_value_fkey" FOREIGN KEY ("d_id", "based_on_value") REFERENCES "frame_of_values" ("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_norms" ("based_on_value", "d_id", "n_id", "norm", "part_of_frame", "u_id") SELECT "based_on_value", "d_id", "n_id", "norm", "part_of_frame", "u_id" FROM "norms";
DROP TABLE "norms";
ALTER TABLE "new_norms" RENAME TO "norms";
CREATE INDEX "norms_d_id_u_id_idx" ON "norms"("d_id", "u_id");
CREATE TABLE "new_user_values" (
    "d_id" TEXT NOT NULL,
    "v_id" INTEGER NOT NULL,
    "u_id" TEXT NOT NULL,

    PRIMARY KEY ("d_id", "v_id", "u_id"),
    CONSTRAINT "user_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_values_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_values_d_id_v_id_fkey" FOREIGN KEY ("d_id", "v_id") REFERENCES "frame_of_values" ("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_values" ("d_id", "u_id", "v_id") SELECT "d_id", "u_id", "v_id" FROM "user_values";
DROP TABLE "user_values";
ALTER TABLE "new_user_values" RENAME TO "user_values";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
