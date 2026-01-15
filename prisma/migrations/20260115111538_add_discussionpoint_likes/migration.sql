-- CreateTable
CREATE TABLE "likes_discussionpoint" (
    "user_likes_id" TEXT NOT NULL,
    "discussionpoint_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_likes_id", "discussionpoint_id"),
    CONSTRAINT "likes_discussionpoint_user_likes_id_fkey" FOREIGN KEY ("user_likes_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "likes_discussionpoint_discussionpoint_id_fkey" FOREIGN KEY ("discussionpoint_id") REFERENCES "discussionpoints" ("dp_id") ON DELETE CASCADE ON UPDATE CASCADE
);
