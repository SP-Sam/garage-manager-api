/*
  Warnings:

  - Added the required column `quantity` to the `PartsOnServices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PartsOnServices" ADD COLUMN     "quantity" INTEGER NOT NULL;
