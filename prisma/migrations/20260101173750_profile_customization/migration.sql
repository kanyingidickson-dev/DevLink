/*
  Warnings:

  - A unique constraint covering the columns `[vanityUrl]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "colorPalette" TEXT,
ADD COLUMN     "vanityUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_vanityUrl_key" ON "Profile"("vanityUrl");
