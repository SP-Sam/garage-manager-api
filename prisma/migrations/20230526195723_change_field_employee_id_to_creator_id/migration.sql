/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_employeeId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "employeeId",
ADD COLUMN     "creatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
