-- Add Id_Perfil to Personas table with a default value of 1
-- First, add the column as nullable
ALTER TABLE "Personas" ADD COLUMN "Id_Perfil" INTEGER;

-- Set a default value for existing records
UPDATE "Personas" SET "Id_Perfil" = 1 WHERE "Id_Perfil" IS NULL;

-- Now alter the column to be NOT NULL
ALTER TABLE "Personas" ALTER COLUMN "Id_Perfil" SET NOT NULL;

-- Add the foreign key constraint
ALTER TABLE "Personas" ADD CONSTRAINT "Personas_Id_Perfil_fkey" 
FOREIGN KEY ("Id_Perfil") REFERENCES "Perfiles"("Id_Perfil");
