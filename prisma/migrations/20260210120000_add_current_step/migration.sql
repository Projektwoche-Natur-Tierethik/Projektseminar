-- Add currentStep to discussions for host-controlled progression
ALTER TABLE "Discussion" ADD COLUMN "currentStep" INTEGER NOT NULL DEFAULT 0;
