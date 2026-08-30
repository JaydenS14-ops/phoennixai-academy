CREATE TABLE `admin_recovery_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_recovery_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_recovery_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
