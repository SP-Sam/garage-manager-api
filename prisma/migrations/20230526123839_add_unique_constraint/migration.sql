/*
  Warnings:

  - A unique constraint covering the columns `[taxId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[taxId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_taxId_key" ON "Customer"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_taxId_key" ON "Employee"("taxId");
