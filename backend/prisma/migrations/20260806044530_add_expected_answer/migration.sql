-- CreateTable
CREATE TABLE "ExpectedAnswer" (
    "id" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "expectedAnswer" TEXT,
    "rubric" JSONB,
    "keywords" JSONB,
    "learningObjectives" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "model" TEXT,
    "promptVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpectedAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpectedAnswer_soalId_key" ON "ExpectedAnswer"("soalId");

-- AddForeignKey
ALTER TABLE "ExpectedAnswer" ADD CONSTRAINT "ExpectedAnswer_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
