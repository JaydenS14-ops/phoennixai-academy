CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(160) NOT NULL,
	`authorRole` varchar(180) NOT NULL,
	`quote` text NOT NULL,
	`consentConfirmed` int NOT NULL DEFAULT 0,
	`published` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_leads` ADD `cohortInterest` varchar(160);