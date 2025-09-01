-- CreateTable
CREATE TABLE `School` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `email_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `School_email_id_key`(`email_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
