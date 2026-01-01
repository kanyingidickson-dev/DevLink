-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "markdown" TEXT,
ADD COLUMN     "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ProjectEndorsement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectEndorsement_projectId_createdAt_idx" ON "ProjectEndorsement"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectEndorsement_userId_createdAt_idx" ON "ProjectEndorsement"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEndorsement_projectId_userId_key" ON "ProjectEndorsement"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectEndorsement" ADD CONSTRAINT "ProjectEndorsement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEndorsement" ADD CONSTRAINT "ProjectEndorsement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
