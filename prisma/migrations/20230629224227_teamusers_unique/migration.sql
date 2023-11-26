/*
  Warnings:

  - The primary key for the `TeamUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TeamUsers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[team_id,user_id]` on the table `TeamUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `TeamUsers` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- CreateIndex
CREATE UNIQUE INDEX `TeamUsers_team_id_user_id_key` ON `TeamUsers`(`team_id`, `user_id`);
