/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CarPart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CarPart_name_key" ON "CarPart"("name");
