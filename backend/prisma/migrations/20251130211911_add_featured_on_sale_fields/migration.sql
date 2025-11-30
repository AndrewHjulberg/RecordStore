-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salePrice" INTEGER;
