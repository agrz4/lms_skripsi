/*
  Warnings:

  - You are about to alter the column `embedding` on the `SoalVector` table. The data in that column could be lost. The data in that column will be cast from `vector(768)` to `Text`.

*/
-- CreateEnum
CREATE TYPE "SoalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EmbeddingStatus" AS ENUM ('WAITING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "MataKuliah" ADD COLUMN     "jumlahPertemuan" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "level" TEXT DEFAULT 'Beginner',
ADD COLUMN     "warna" TEXT DEFAULT 'blue';

-- AlterTable
ALTER TABLE "Materi" ADD COLUMN     "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "Pendaftaran" ADD COLUMN     "harga" TEXT DEFAULT '0',
ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "method" TEXT DEFAULT 'Mandiri Virtual Account',
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'Lunas';

-- AlterTable
ALTER TABLE "Soal" ADD COLUMN     "status" "SoalStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "SoalVector" ALTER COLUMN "embedding" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pertemuanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "score" DOUBLE PRECISION,
    "aiScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pertemuanId" TEXT NOT NULL,
    "watchedTime" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ujian" (
    "id" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "durasi" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UjianSubmission" (
    "id" TEXT NOT NULL,
    "ujianId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "answers" JSONB NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UjianSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "hargaPaket" TEXT NOT NULL DEFAULT '0',
    "hargaAsli" TEXT NOT NULL DEFAULT '0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MataKuliahPrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MataKuliahPrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PaketMataKuliah" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaketMataKuliah_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_pertemuanId_type_key" ON "Submission"("userId", "pertemuanId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_userId_pertemuanId_key" ON "StudentProgress"("userId", "pertemuanId");

-- CreateIndex
CREATE UNIQUE INDEX "Ujian_mataKuliahId_key" ON "Ujian"("mataKuliahId");

-- CreateIndex
CREATE UNIQUE INDEX "UjianSubmission_userId_ujianId_key" ON "UjianSubmission"("userId", "ujianId");

-- CreateIndex
CREATE INDEX "_MataKuliahPrerequisites_B_index" ON "_MataKuliahPrerequisites"("B");

-- CreateIndex
CREATE INDEX "_PaketMataKuliah_B_index" ON "_PaketMataKuliah"("B");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ujian" ADD CONSTRAINT "Ujian_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UjianSubmission" ADD CONSTRAINT "UjianSubmission_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UjianSubmission" ADD CONSTRAINT "UjianSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MataKuliahPrerequisites" ADD CONSTRAINT "_MataKuliahPrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "MataKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MataKuliahPrerequisites" ADD CONSTRAINT "_MataKuliahPrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "MataKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaketMataKuliah" ADD CONSTRAINT "_PaketMataKuliah_A_fkey" FOREIGN KEY ("A") REFERENCES "MataKuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaketMataKuliah" ADD CONSTRAINT "_PaketMataKuliah_B_fkey" FOREIGN KEY ("B") REFERENCES "Paket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
