/*
  Warnings:

  - You are about to drop the column `currentStep` on the `discussion` table. All the data in the column will be lost.

*/
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
    "step" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_discussion" ("d_code", "d_id", "discussion_theme", "inclusion_problem_part_of", "norms_part_of", "questions_per_participant", "step", "values_selection_count") SELECT "d_code", "d_id", "discussion_theme", "inclusion_problem_part_of", "norms_part_of", "questions_per_participant", "step", "values_selection_count" FROM "discussion";
DROP TABLE "discussion";
ALTER TABLE "new_discussion" RENAME TO "discussion";
CREATE UNIQUE INDEX "discussion_d_code_key" ON "discussion"("d_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
