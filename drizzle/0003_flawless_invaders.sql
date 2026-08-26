CREATE TABLE `archive_moments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`caption` text NOT NULL,
	`category` varchar(96) NOT NULL,
	`imageKey` varchar(512) NOT NULL,
	`imageUrl` text NOT NULL,
	`bentoSize` enum('standard','wide','tall','feature') NOT NULL DEFAULT 'standard',
	`published` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`capturedAt` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `archive_moments_id` PRIMARY KEY(`id`)
);
