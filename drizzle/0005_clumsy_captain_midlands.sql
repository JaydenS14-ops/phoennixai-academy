CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(48) NOT NULL,
	`path` varchar(255) NOT NULL,
	`visitorKey` varchar(128) NOT NULL,
	`source` varchar(48) NOT NULL DEFAULT 'direct',
	`pathway` varchar(160),
	`detail` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
