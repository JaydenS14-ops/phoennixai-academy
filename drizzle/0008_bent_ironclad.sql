CREATE TABLE `admin_sign_ins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_sign_ins_id` PRIMARY KEY(`id`)
);
