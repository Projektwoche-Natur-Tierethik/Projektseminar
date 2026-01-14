/*
  Warnings:

  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscussionQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionSkipVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValueSelection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CommentLike";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Discussion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DiscussionQuestion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Participant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuestionComment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuestionSkipVote";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepResponse";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepStatus";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ValueSelection";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "user_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "salt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "discussion" (
    "d_id" TEXT NOT NULL PRIMARY KEY,
    "d_code" INTEGER NOT NULL,
    "discussion_theme" TEXT NOT NULL,
    "inclusion_problem_part_of" BOOLEAN NOT NULL DEFAULT false,
    "norms_part_of" BOOLEAN NOT NULL DEFAULT false,
    "step" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "participants" (
    "p_id" TEXT NOT NULL PRIMARY KEY,
    "u_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "main_conclusion" TEXT,
    "continue_button" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "participants_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "participants_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discussionpoints" (
    "dp_id" TEXT NOT NULL PRIMARY KEY,
    "written_by_u_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "marked_as_complete" BOOLEAN NOT NULL DEFAULT false,
    "discussion_point" TEXT NOT NULL,
    CONSTRAINT "discussionpoints_written_by_u_id_fkey" FOREIGN KEY ("written_by_u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "discussionpoints_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conclusions_discussionpoints" (
    "dp_conclusion_id" TEXT NOT NULL PRIMARY KEY,
    "dp_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    CONSTRAINT "conclusions_discussionpoints_dp_id_fkey" FOREIGN KEY ("dp_id") REFERENCES "discussionpoints" ("dp_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conclusions_discussionpoints_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "likes_discussionpoint_conclusion" (
    "user_likes_id" TEXT NOT NULL,
    "dp_conclusion_id" TEXT NOT NULL,
    "conclusion_written_by_user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_likes_id", "dp_conclusion_id", "conclusion_written_by_user_id"),
    CONSTRAINT "likes_discussionpoint_conclusion_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_discussionpoint_conclusion_dp_conclusion_id_fkey" FOREIGN KEY ("dp_conclusion_id") REFERENCES "conclusions_discussionpoints" ("dp_conclusion_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_discussionpoint_conclusion_conclusion_written_by_user_id_fkey" FOREIGN KEY ("conclusion_written_by_user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "likes_discussion_conclusion" (
    "user_likes_id" TEXT NOT NULL,
    "participants_conclusion_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_likes_id", "participants_conclusion_id"),
    CONSTRAINT "likes_discussion_conclusion_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_discussion_conclusion_participants_conclusion_id_fkey" FOREIGN KEY ("participants_conclusion_id") REFERENCES "participants" ("p_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "frame_of_values" (
    "d_id" TEXT NOT NULL,
    "v_id" TEXT NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("d_id", "v_id"),
    CONSTRAINT "frame_of_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "frame_of_values_v_id_fkey" FOREIGN KEY ("v_id") REFERENCES "values" ("v_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_values" (
    "d_id" TEXT NOT NULL,
    "v_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,

    PRIMARY KEY ("d_id", "v_id", "u_id"),
    CONSTRAINT "user_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_values_v_id_fkey" FOREIGN KEY ("v_id") REFERENCES "values" ("v_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_values_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_values_d_id_v_id_fkey" FOREIGN KEY ("d_id", "v_id") REFERENCES "frame_of_values" ("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "values" (
    "v_id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "norms" (
    "n_id" TEXT NOT NULL PRIMARY KEY,
    "d_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "norm" TEXT NOT NULL,
    "based_on_value" TEXT NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "norms_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion" ("d_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "norms_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "norms_d_id_based_on_value_fkey" FOREIGN KEY ("d_id", "based_on_value") REFERENCES "frame_of_values" ("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_d_code_key" ON "discussion"("d_code");

-- CreateIndex
CREATE UNIQUE INDEX "participants_u_id_d_id_key" ON "participants"("u_id", "d_id");

-- CreateIndex
CREATE UNIQUE INDEX "conclusions_discussionpoints_dp_id_u_id_key" ON "conclusions_discussionpoints"("dp_id", "u_id");

-- CreateIndex
CREATE UNIQUE INDEX "values_value_key" ON "values"("value");

-- CreateIndex
CREATE INDEX "norms_d_id_u_id_idx" ON "norms"("d_id", "u_id");
