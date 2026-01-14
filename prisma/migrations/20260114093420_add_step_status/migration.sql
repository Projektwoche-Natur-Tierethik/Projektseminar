-- CreateTable
CREATE TABLE "StepStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "step" INTEGER NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "participantId" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    CONSTRAINT "StepStatus_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepStatus_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StepStatus_participantId_step_key" ON "StepStatus"("participantId", "step");
