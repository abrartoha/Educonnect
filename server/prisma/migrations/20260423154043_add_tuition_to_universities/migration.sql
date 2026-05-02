-- AlterTable
ALTER TABLE "UniversityProfile" ADD COLUMN     "tuitionCurrency" TEXT NOT NULL DEFAULT 'AUD',
ADD COLUMN     "tuitionMax" INTEGER,
ADD COLUMN     "tuitionMin" INTEGER;
