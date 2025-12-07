/*
  Warnings:

  - You are about to drop the column `imageMime_frong` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "imageMime_frong",
ADD COLUMN     "imageMime_front" TEXT;
