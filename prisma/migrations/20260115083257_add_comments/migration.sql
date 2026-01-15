-- CreateTable
CREATE TABLE "comments" (
    "comment_id" TEXT NOT NULL PRIMARY KEY,
    "written_by_uid" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "comments_written_by_uid_fkey" FOREIGN KEY ("written_by_uid") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_on_conclusion_discussio_point" (
    "comment_id" TEXT NOT NULL,
    "cdp_id" TEXT NOT NULL,

    PRIMARY KEY ("comment_id", "cdp_id"),
    CONSTRAINT "comment_on_conclusion_discussio_point_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("comment_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_on_conclusion_discussio_point_cdp_id_fkey" FOREIGN KEY ("cdp_id") REFERENCES "conclusions_discussionpoints" ("dp_conclusion_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_on_conclusion_discussio" (
    "comment_id" TEXT NOT NULL,
    "participants_id_that_wrote_conclusion" TEXT NOT NULL,

    PRIMARY KEY ("comment_id", "participants_id_that_wrote_conclusion"),
    CONSTRAINT "comment_on_conclusion_discussio_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("comment_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_on_conclusion_discussio_participants_id_that_wrote_conclusion_fkey" FOREIGN KEY ("participants_id_that_wrote_conclusion") REFERENCES "participants" ("p_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment_on_comment_rec" (
    "commented_on_id" TEXT NOT NULL,
    "new_comment_id" TEXT NOT NULL,

    PRIMARY KEY ("commented_on_id", "new_comment_id"),
    CONSTRAINT "comment_on_comment_rec_commented_on_id_fkey" FOREIGN KEY ("commented_on_id") REFERENCES "comments" ("comment_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_on_comment_rec_new_comment_id_fkey" FOREIGN KEY ("new_comment_id") REFERENCES "comments" ("comment_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "likes_comments" (
    "user_likes_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_likes_id", "comment_id"),
    CONSTRAINT "likes_comments_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_comments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments" ("comment_id") ON DELETE CASCADE ON UPDATE CASCADE
);
