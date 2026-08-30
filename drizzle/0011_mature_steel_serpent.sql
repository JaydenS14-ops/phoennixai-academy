CREATE TABLE `admin_credential_overrides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passwordHash` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_credential_overrides_id` PRIMARY KEY(`id`)
);
