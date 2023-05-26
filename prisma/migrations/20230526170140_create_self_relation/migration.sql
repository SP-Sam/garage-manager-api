-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employeeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
