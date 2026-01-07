-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "location" TEXT,
ADD COLUMN     "openToWork" BOOLEAN NOT NULL DEFAULT false;
