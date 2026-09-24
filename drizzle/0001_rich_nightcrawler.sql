CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(160) NOT NULL,
	`company` varchar(160) NOT NULL,
	`dates` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homepage_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionKey` varchar(40) NOT NULL,
	`label` varchar(100) NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepage_sections_sectionKey_unique` UNIQUE(`sectionKey`)
);
--> statement-breakpoint
CREATE TABLE `profile_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initials` varchar(12) NOT NULL,
	`name` varchar(160) NOT NULL,
	`heroTag` varchar(120) NOT NULL,
	`heroFirstName` varchar(80) NOT NULL,
	`heroHighlightName` varchar(80) NOT NULL,
	`heroLastName` varchar(80) NOT NULL,
	`subtitle` varchar(180) NOT NULL,
	`heroDescription` text NOT NULL,
	`profileImageUrl` text NOT NULL,
	`profileImageAlt` varchar(180) NOT NULL,
	`aboutIntro` text NOT NULL,
	`aboutDescription` text NOT NULL,
	`contactHeading` varchar(180) NOT NULL,
	`contactText` text NOT NULL,
	`footerTagline` varchar(160) NOT NULL,
	`socialLinks` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`tags` text NOT NULL,
	`githubUrl` text NOT NULL,
	`liveUrl` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`items` text NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skill_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `profile_content` (
	`id`, `initials`, `name`, `heroTag`, `heroFirstName`, `heroHighlightName`, `heroLastName`, `subtitle`, `heroDescription`, `profileImageUrl`, `profileImageAlt`, `aboutIntro`, `aboutDescription`, `contactHeading`, `contactText`, `footerTagline`, `socialLinks`
) VALUES (
	1,
	'SNK',
	'Saviour Nwibari Koki',
	'INNOVATIVE DEV',
	'SAVIOUR',
	'NWIBARI',
	'KOKI',
	'Frontend Developer & GIS Analyst',
	'Crafting pixel-perfect web experiences and transforming spatial data into actionable insights. Bridging the gap between beautiful interfaces and geographic intelligence.',
	'/manus-storage/profile_af01b11e.jpg',
	'Saviour Nwibari Koki',
	"I'm a passionate developer with a unique blend of frontend expertise and geographic information systems knowledge. My work sits at the intersection of beautiful user interfaces and data-driven spatial analysis.",
	'With a strong foundation in modern web technologies and GIS tools, I create interactive mapping applications, responsive websites, and data visualizations that help people understand complex geographic patterns and make informed decisions.',
	"LET'S WORK TOGETHER",
	"Have a project in mind? Whether it's a web application, GIS solution, or data visualization, I'd love to hear about it. Let's create something amazing!",
	'I will be Better.',
	'{"github":"https://github.com/subtleswashbuckler","linkedin":"https://www.linkedin.com/in/saviour-koki-1a34bb247/","twitter":"https://x.com/Sswashbuckler1?t=AyC0FOUe_tqJyjfuTmmksg&s=09","email":"saviourbarry46@gmail.com"}'
);
--> statement-breakpoint
INSERT INTO `projects` (`title`, `description`, `tags`, `githubUrl`, `liveUrl`, `isPublished`, `displayOrder`) VALUES
('Web based GIS analyser for flood risk', 'Web GIS solution for identifying flood-prone areas using DEM analysis and hydrological modeling. Includes emergency response planning tools.', '["JavaScript","HTML & CSS3","Leaflet","QGIS","GeoJSON"]', 'https://github.com/subtleswashbuckler/Web_Gis_Site', 'https://web-gis-analyser.netlify.app/', true, 1),
('Fitmap', 'FitMap is a comprehensive fitness companion application designed to make finding and booking gyms easier than ever. Whether you are looking to lose weight, gain muscle, or maintain your fitness, FitMap connects you with the best gym centers in your area.', '["HTML5","CSS3","JAVASCRIPT","Localstorage API"]', 'https://github.com/subtleswashbuckler/fitmap.git', 'https://fitmap-beta.vercel.app/', true, 2),
('Urban Heat Island Analysis', 'Spatial analysis of temperature variations across urban areas using satellite imagery and remote sensing techniques. Interactive visualization dashboard.', '["ArcGIS","Remote Sensing","D3.js","Python"]', '', '', true, 3),
('Weather Forecast App', 'Clean and intuitive weather application with location search, 5-day forecast, and beautiful weather animations. Responsive across all devices.', '["JavaScript","Weather API","CSS3","Animations"]', '', '', true, 4);
--> statement-breakpoint
INSERT INTO `skill_groups` (`category`, `items`, `isVisible`, `displayOrder`) VALUES
('FRONTEND', '["HTML5 & CSS3","JavaScript (ES6+)","React.js","Responsive Design"]', true, 1),
('GIS', '["QGIS","Remote Sensing","Spatial Analysis"]', true, 2),
('TOOLS', '["Git & GitHub","RESTful APIs","Data Visualization","Leaflet/Mapbox","PostgreSQL/PostGIS"]', true, 3);
--> statement-breakpoint
INSERT INTO `services` (`title`, `description`, `isVisible`, `displayOrder`) VALUES
('FRONTEND DEVELOPMENT', 'Building responsive, performant, and accessible web applications using modern frameworks and best practices. From landing pages to complex SPAs.', true, 1),
('WEB MAP DEVELOPMENT', 'Creating interactive web maps and location-based applications with custom styling, spatial queries, and seamless user experiences.', true, 2),
('GIS ANALYSIS & MAPPING', 'Professional spatial analysis, cartographic design, and geospatial data processing using industry-standard GIS tools and methodologies.', true, 3),
('DATA VISUALIZATION', 'Transforming complex datasets into clear, insightful visual stories through interactive charts, dashboards, and custom visualizations.', true, 4);
--> statement-breakpoint
INSERT INTO `homepage_sections` (`sectionKey`, `label`, `isVisible`, `displayOrder`) VALUES
('home', 'Home', true, 1),
('about', 'About', true, 2),
('projects', 'Projects', true, 3),
('services', 'Services', true, 4),
('experience', 'Experience', true, 5),
('contact', 'Contact', true, 6);
