/*
  Warnings:

  - You are about to drop the `Jadwal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pertemuanId` to the `Materi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Jadwal" DROP CONSTRAINT "Jadwal_asistenId_fkey";

-- DropForeignKey
ALTER TABLE "Jadwal" DROP CONSTRAINT "Jadwal_dosenId_fkey";

-- DropForeignKey
ALTER TABLE "Jadwal" DROP CONSTRAINT "Jadwal_mataKuliahId_fkey";

-- AlterTable
ALTER TABLE "Materi" ADD COLUMN     "pertemuanId" TEXT NOT NULL,
ADD COLUMN     "refleksi" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Soal" ADD COLUMN     "pertemuanId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instansi" TEXT,
ADD COLUMN     "jadwal" TEXT,
ADD COLUMN     "pelatihan" TEXT;

-- DropTable
DROP TABLE "Jadwal";

-- CreateTable
CREATE TABLE "Pertemuan" (
    "id" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "topik" TEXT,
    "tgl" TIMESTAMP(3),
    "jam" TEXT,
    "dosenId" TEXT,
    "asistenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pertemuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sertifikat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "noSertifikat" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sertifikat_noSertifikat_key" ON "Sertifikat"("noSertifikat");

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pertemuan" ADD CONSTRAINT "Pertemuan_asistenId_fkey" FOREIGN KEY ("asistenId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_pertemuanId_fkey" FOREIGN KEY ("pertemuanId") REFERENCES "Pertemuan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
