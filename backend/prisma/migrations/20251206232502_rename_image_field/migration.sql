/*
  Warnings:

  - You are about to drop the column `imageBase64` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "imageBase64",
ADD COLUMN     "imageBase64_front" TEXT;
