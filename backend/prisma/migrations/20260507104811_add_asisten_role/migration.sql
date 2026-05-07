-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MAHASISWA', 'DOSEN', 'ASISTEN', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipeSoal" AS ENUM ('PILIHAN_GANDA', 'ESSAY', 'BENAR_SALAH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MAHASISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soal" (
    "id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "tipesoal" "TipeSoal" NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "dibuatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluasi" (
    "id" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "skorKualitas" DOUBLE PRECISION NOT NULL,
    "tingkatKesulitan" TEXT NOT NULL,
    "isDuplikat" BOOLEAN NOT NULL DEFAULT false,
    "saranPerbaikan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoalVector" (
    "id" TEXT NOT NULL,
    "soalId" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoalVector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "SoalVector_soalId_key" ON "SoalVector"("soalId");

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "MataKuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_dibuatOleh_fkey" FOREIGN KEY ("dibuatOleh") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluasi" ADD CONSTRAINT "Evaluasi_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalVector" ADD CONSTRAINT "SoalVector_soalId_fkey" FOREIGN KEY ("soalId") REFERENCES "Soal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
