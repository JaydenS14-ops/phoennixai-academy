CREATE TABLE `academy_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`eventDate` varchar(96) NOT NULL,
	`lumaUrl` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_events_id` PRIMARY KEY(`id`)
);
