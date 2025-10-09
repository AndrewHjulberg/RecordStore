/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_sellerId_fkey";

-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "sellerId";
