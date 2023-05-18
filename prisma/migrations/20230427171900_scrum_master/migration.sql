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

INSERT INTO `TeamUsers` (id, `team_id`, `user_id`, `role`)
# todo delete duplicates and add constraint unique(team_id, user_id)
SELECT UUID(), Team.`id`, `owner_id`, 'ADMIN' FROM `Team`
    JOIN `User` ON `User`.`id` = `Team`.`owner_id`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `user_type`;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_from_fkey` FOREIGN KEY (`from`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
