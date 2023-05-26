/*
  Warnings:

  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - The `status` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `employeeId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceStatusEnum" AS ENUM ('STARTED', 'FINISHED', 'PENDING');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "name",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD COLUMN     "fullName" VARCHAR(64) NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "status",
ADD COLUMN     "status" "ServiceStatusEnum" NOT NULL DEFAULT 'STARTED';

-- DropEnum
DROP TYPE "Status";

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
