/*
  Warnings:

  - You are about to drop the column `from_scrum_id` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `user_type` on the `User` table. All the data in the column will be lost.
  - Added the required column `from` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `TeamUsers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Invite` DROP FOREIGN KEY `Invite_from_scrum_id_fkey`;

-- DropForeignKey
ALTER TABLE `Team` DROP FOREIGN KEY `Team_scrum_master_id_fkey`;

-- AlterTable
ALTER TABLE `Invite`
    RENAME COLUMN `from_scrum_id` TO `from`,
    ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `Team`
    RENAME COLUMN `scrum_master_id` TO `owner_id`;

-- AlterTable
ALTER TABLE `TeamUsers` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

INSERT INTO `TeamUsers` (`team_id`, `user_id`, `role`)
SELECT `team_id`, `user_id`, 'ADMIN' FROM `Team`
    JOIN `User` ON `User`.`id` = `Team`.`owner_id`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `user_type`;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_from_fkey` FOREIGN KEY (`from`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
