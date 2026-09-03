-- CreateTable
CREATE TABLE "MateriVector" (
    "id" TEXT NOT NULL,
    "materiId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MateriVector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MateriVector_materiId_idx" ON "MateriVector"("materiId");

-- AddForeignKey
ALTER TABLE "MateriVector" ADD CONSTRAINT "MateriVector_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
