-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "discussion" (
    "d_id" TEXT NOT NULL,
    "d_code" INTEGER NOT NULL,
    "discussion_theme" TEXT NOT NULL,
    "inclusion_problem_part_of" BOOLEAN NOT NULL DEFAULT false,
    "norms_part_of" BOOLEAN NOT NULL DEFAULT false,
    "values_selection_count" INTEGER NOT NULL DEFAULT 10,
    "questions_per_participant" INTEGER NOT NULL DEFAULT 5,
    "step" INTEGER NOT NULL DEFAULT 0,
    "current_discussion_point_id" TEXT,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("d_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "p_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "main_conclusion" TEXT,
    "continue_button" BOOLEAN NOT NULL DEFAULT false,
    "move_on_button" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("p_id")
);

-- CreateTable
CREATE TABLE "discussionpoints" (
    "dp_id" TEXT NOT NULL,
    "written_by_u_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "marked_as_complete" BOOLEAN NOT NULL DEFAULT false,
    "discussion_point" TEXT NOT NULL,

    CONSTRAINT "discussionpoints_pkey" PRIMARY KEY ("dp_id")
);

-- CreateTable
CREATE TABLE "conclusions_discussionpoints" (
    "dp_conclusion_id" TEXT NOT NULL,
    "dp_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,

    CONSTRAINT "conclusions_discussionpoints_pkey" PRIMARY KEY ("dp_conclusion_id")
);

-- CreateTable
CREATE TABLE "likes_discussionpoint_conclusion" (
    "user_likes_id" TEXT NOT NULL,
    "dp_conclusion_id" TEXT NOT NULL,
    "conclusion_written_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_discussionpoint_conclusion_pkey" PRIMARY KEY ("user_likes_id","dp_conclusion_id","conclusion_written_by_user_id")
);

-- CreateTable
CREATE TABLE "likes_discussion_conclusion" (
    "user_likes_id" TEXT NOT NULL,
    "participants_conclusion_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_discussion_conclusion_pkey" PRIMARY KEY ("user_likes_id","participants_conclusion_id")
);

-- CreateTable
CREATE TABLE "likes_discussionpoint" (
    "user_likes_id" TEXT NOT NULL,
    "discussionpoint_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_discussionpoint_pkey" PRIMARY KEY ("user_likes_id","discussionpoint_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" TEXT NOT NULL,
    "written_by_uid" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "comment_on_conclusion_discussio_point" (
    "comment_id" TEXT NOT NULL,
    "cdp_id" TEXT NOT NULL,

    CONSTRAINT "comment_on_conclusion_discussio_point_pkey" PRIMARY KEY ("comment_id","cdp_id")
);

-- CreateTable
CREATE TABLE "comment_on_conclusion_discussio" (
    "comment_id" TEXT NOT NULL,
    "participants_id_that_wrote_conclusion" TEXT NOT NULL,

    CONSTRAINT "comment_on_conclusion_discussio_pkey" PRIMARY KEY ("comment_id","participants_id_that_wrote_conclusion")
);

-- CreateTable
CREATE TABLE "comment_on_comment_rec" (
    "commented_on_id" TEXT NOT NULL,
    "new_comment_id" TEXT NOT NULL,

    CONSTRAINT "comment_on_comment_rec_pkey" PRIMARY KEY ("commented_on_id","new_comment_id")
);

-- CreateTable
CREATE TABLE "likes_comments" (
    "user_likes_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_comments_pkey" PRIMARY KEY ("user_likes_id","comment_id")
);

-- CreateTable
CREATE TABLE "frame_of_values" (
    "d_id" TEXT NOT NULL,
    "v_id" INTEGER NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "frame_of_values_pkey" PRIMARY KEY ("d_id","v_id")
);

-- CreateTable
CREATE TABLE "user_values" (
    "d_id" TEXT NOT NULL,
    "v_id" INTEGER NOT NULL,
    "u_id" TEXT NOT NULL,

    CONSTRAINT "user_values_pkey" PRIMARY KEY ("d_id","v_id","u_id")
);

-- CreateTable
CREATE TABLE "norms" (
    "n_id" TEXT NOT NULL,
    "d_id" TEXT NOT NULL,
    "u_id" TEXT NOT NULL,
    "norm" TEXT NOT NULL,
    "based_on_value" INTEGER NOT NULL,
    "part_of_frame" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "norms_pkey" PRIMARY KEY ("n_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_d_code_key" ON "discussion"("d_code");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_current_discussion_point_id_key" ON "discussion"("current_discussion_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_u_id_d_id_key" ON "participants"("u_id", "d_id");

-- CreateIndex
CREATE UNIQUE INDEX "conclusions_discussionpoints_dp_id_u_id_key" ON "conclusions_discussionpoints"("dp_id", "u_id");

-- CreateIndex
CREATE INDEX "norms_d_id_u_id_idx" ON "norms"("d_id", "u_id");

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_current_discussion_point_id_fkey" FOREIGN KEY ("current_discussion_point_id") REFERENCES "discussionpoints"("dp_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion"("d_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussionpoints" ADD CONSTRAINT "discussionpoints_written_by_u_id_fkey" FOREIGN KEY ("written_by_u_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussionpoints" ADD CONSTRAINT "discussionpoints_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion"("d_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusions_discussionpoints" ADD CONSTRAINT "conclusions_discussionpoints_dp_id_fkey" FOREIGN KEY ("dp_id") REFERENCES "discussionpoints"("dp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conclusions_discussionpoints" ADD CONSTRAINT "conclusions_discussionpoints_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussionpoint_conclusion" ADD CONSTRAINT "likes_discussionpoint_conclusion_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussionpoint_conclusion" ADD CONSTRAINT "likes_discussionpoint_conclusion_dp_conclusion_id_fkey" FOREIGN KEY ("dp_conclusion_id") REFERENCES "conclusions_discussionpoints"("dp_conclusion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussionpoint_conclusion" ADD CONSTRAINT "likes_discussionpoint_conclusion_conclusion_written_by_use_fkey" FOREIGN KEY ("conclusion_written_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussion_conclusion" ADD CONSTRAINT "likes_discussion_conclusion_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussion_conclusion" ADD CONSTRAINT "likes_discussion_conclusion_participants_conclusion_id_fkey" FOREIGN KEY ("participants_conclusion_id") REFERENCES "participants"("p_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussionpoint" ADD CONSTRAINT "likes_discussionpoint_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_discussionpoint" ADD CONSTRAINT "likes_discussionpoint_discussionpoint_id_fkey" FOREIGN KEY ("discussionpoint_id") REFERENCES "discussionpoints"("dp_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_written_by_uid_fkey" FOREIGN KEY ("written_by_uid") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_conclusion_discussio_point" ADD CONSTRAINT "comment_on_conclusion_discussio_point_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_conclusion_discussio_point" ADD CONSTRAINT "comment_on_conclusion_discussio_point_cdp_id_fkey" FOREIGN KEY ("cdp_id") REFERENCES "conclusions_discussionpoints"("dp_conclusion_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_conclusion_discussio" ADD CONSTRAINT "comment_on_conclusion_discussio_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_conclusion_discussio" ADD CONSTRAINT "comment_on_conclusion_discussio_participants_id_that_wrote_fkey" FOREIGN KEY ("participants_id_that_wrote_conclusion") REFERENCES "participants"("p_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_comment_rec" ADD CONSTRAINT "comment_on_comment_rec_commented_on_id_fkey" FOREIGN KEY ("commented_on_id") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_on_comment_rec" ADD CONSTRAINT "comment_on_comment_rec_new_comment_id_fkey" FOREIGN KEY ("new_comment_id") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_comments" ADD CONSTRAINT "likes_comments_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_comments" ADD CONSTRAINT "likes_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame_of_values" ADD CONSTRAINT "frame_of_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion"("d_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_values" ADD CONSTRAINT "user_values_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion"("d_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_values" ADD CONSTRAINT "user_values_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_values" ADD CONSTRAINT "user_values_d_id_v_id_fkey" FOREIGN KEY ("d_id", "v_id") REFERENCES "frame_of_values"("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norms" ADD CONSTRAINT "norms_d_id_fkey" FOREIGN KEY ("d_id") REFERENCES "discussion"("d_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norms" ADD CONSTRAINT "norms_u_id_fkey" FOREIGN KEY ("u_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "norms" ADD CONSTRAINT "norms_d_id_based_on_value_fkey" FOREIGN KEY ("d_id", "based_on_value") REFERENCES "frame_of_values"("d_id", "v_id") ON DELETE CASCADE ON UPDATE CASCADE;
