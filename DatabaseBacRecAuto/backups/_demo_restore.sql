-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: budget-planner-3-chhounvannaksokpanhaclone-5bb3.k.aivencloud.com    Database: Budget_Planner
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `Budget_Planner_demo`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `Budget_Planner_demo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `Budget_Planner_demo`;

--
-- Table structure for table `budget_group_members`
--

DROP TABLE IF EXISTS `budget_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_group_members` (
  `member_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  `member_role` varchar(20) NOT NULL DEFAULT 'member',
  `joined_at` datetime NOT NULL,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `budget_group_members_user_id_group_id` (`user_id`,`group_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `budget_group_members_ibfk_187` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `budget_group_members_ibfk_188` FOREIGN KEY (`group_id`) REFERENCES `budget_groups` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_group_members`
--

LOCK TABLES `budget_group_members` WRITE;
/*!40000 ALTER TABLE `budget_group_members` DISABLE KEYS */;
INSERT INTO `budget_group_members` VALUES (2,1,2,'owner','2026-07-10 08:44:56'),(5,6,5,'owner','2026-07-10 08:55:37'),(7,8,7,'owner','2026-07-10 08:58:21'),(13,9,2,'member','2026-07-10 10:20:44'),(15,1,9,'owner','2026-07-11 04:14:51'),(16,6,2,'member','2026-07-11 05:13:50');
/*!40000 ALTER TABLE `budget_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_groups`
--

DROP TABLE IF EXISTS `budget_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_groups` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `group_budget` decimal(10,2) DEFAULT '0.00',
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_groups`
--

LOCK TABLES `budget_groups` WRITE;
/*!40000 ALTER TABLE `budget_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `budget_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `monthly_income` decimal(10,2) DEFAULT '0.00',
  `daily_allowance` decimal(10,2) DEFAULT '0.00',
  `start_date` date NOT NULL,
  PRIMARY KEY (`budget_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#6B7280',
  PRIMARY KEY (`category_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'Rent','#FF6B6B'),(2,1,'Groceries','#FFA94D'),(3,1,'Utilities','#FFD43B'),(4,1,'Transport','#69DB7C'),(5,1,'Food & Drink','#38D9A9'),(6,1,'School Fees','#4DABF7'),(7,1,'Entertainment','#748FFC'),(8,1,'Other','#868E96'),(9,2,'Rent','#FF6B6B'),(10,2,'Groceries','#FFA94D'),(11,2,'Utilities','#FFD43B'),(12,2,'Transport','#69DB7C'),(13,2,'Food & Drink','#38D9A9'),(14,2,'School Fees','#4DABF7'),(15,2,'Entertainment','#748FFC'),(16,2,'Other','#868E96'),(17,3,'Rent','#FF6B6B'),(18,3,'Groceries','#FFA94D'),(19,3,'Utilities','#FFD43B'),(20,3,'Transport','#69DB7C'),(21,3,'Food & Drink','#38D9A9'),(22,3,'School Fees','#4DABF7'),(23,3,'Entertainment','#748FFC'),(24,3,'Other','#868E96'),(25,4,'Rent','#FF6B6B'),(26,4,'Groceries','#FFA94D'),(27,4,'Utilities','#FFD43B'),(28,4,'Transport','#69DB7C'),(29,4,'Food & Drink','#38D9A9'),(30,4,'School Fees','#4DABF7'),(31,4,'Entertainment','#748FFC'),(32,4,'Other','#868E96'),(33,5,'Rent','#FF6B6B'),(34,5,'Groceries','#FFA94D'),(35,5,'Utilities','#FFD43B'),(36,5,'Transport','#69DB7C'),(37,5,'Food & Drink','#38D9A9'),(38,5,'School Fees','#4DABF7'),(39,5,'Entertainment','#748FFC'),(40,5,'Other','#868E96'),(41,6,'Rent','#FF6B6B'),(42,6,'Groceries','#FFA94D'),(43,6,'Utilities','#FFD43B'),(44,6,'Transport','#69DB7C'),(45,6,'Food & Drink','#38D9A9'),(46,6,'School Fees','#4DABF7'),(47,6,'Entertainment','#748FFC'),(48,6,'Other','#868E96'),(57,8,'Rent','#FF6B6B'),(58,8,'Groceries','#FFA94D'),(59,8,'Utilities','#FFD43B'),(60,8,'Transport','#69DB7C'),(61,8,'Food & Drink','#38D9A9'),(62,8,'School Fees','#4DABF7'),(63,8,'Entertainment','#748FFC'),(64,8,'Other','#868E96'),(65,9,'Rent','#FF6B6B'),(66,9,'Groceries','#FFA94D'),(67,9,'Utilities','#FFD43B'),(68,9,'Transport','#69DB7C'),(69,9,'Food & Drink','#38D9A9'),(70,9,'School Fees','#4DABF7'),(71,9,'Entertainment','#748FFC'),(72,9,'Other','#868E96'),(73,10,'Rent','#FF6B6B'),(74,10,'Groceries','#FFA94D'),(75,10,'Utilities','#FFD43B'),(76,10,'Transport','#69DB7C'),(77,10,'Food & Drink','#38D9A9'),(78,10,'School Fees','#4DABF7'),(79,10,'Entertainment','#748FFC'),(80,10,'Other','#868E96'),(81,11,'Rent','#FF6B6B'),(82,11,'Groceries','#FFA94D'),(83,11,'Utilities','#FFD43B'),(84,11,'Transport','#69DB7C'),(85,11,'Food & Drink','#38D9A9'),(86,11,'School Fees','#4DABF7'),(87,11,'Entertainment','#748FFC'),(88,11,'Other','#868E96'),(89,12,'Rent','#FF6B6B'),(90,12,'Groceries','#FFA94D'),(91,12,'Utilities','#FFD43B'),(92,12,'Transport','#69DB7C'),(93,12,'Food & Drink','#38D9A9'),(94,12,'School Fees','#4DABF7'),(95,12,'Entertainment','#748FFC'),(96,12,'Other','#868E96');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contributions`
--

DROP TABLE IF EXISTS `contributions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contributions` (
  `contribution_id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `qr_code` text,
  `qr_md5` varchar(32) DEFAULT NULL,
  `qr_expiration` bigint DEFAULT NULL,
  `bakong_hash` varchar(255) DEFAULT NULL,
  `confirmed_by` int DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`contribution_id`),
  KEY `contributions_group_id_user_id` (`group_id`,`user_id`),
  KEY `contributions_qr_md5` (`qr_md5`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `contributions_ibfk_11` FOREIGN KEY (`group_id`) REFERENCES `budget_groups` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contributions_ibfk_12` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contributions`
--

LOCK TABLES `contributions` WRITE;
/*!40000 ALTER TABLE `contributions` DISABLE KEYS */;
/*!40000 ALTER TABLE `contributions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_items`
--

DROP TABLE IF EXISTS `expense_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `expense_id` (`expense_id`),
  CONSTRAINT `expense_items_ibfk_1` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`expense_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_items`
--

LOCK TABLES `expense_items` WRITE;
/*!40000 ALTER TABLE `expense_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `expense_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_presets`
--

DROP TABLE IF EXISTS `expense_presets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_presets` (
  `preset_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`preset_id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `expense_presets_ibfk_149` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expense_presets_ibfk_150` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_presets`
--

LOCK TABLES `expense_presets` WRITE;
/*!40000 ALTER TABLE `expense_presets` DISABLE KEYS */;
INSERT INTO `expense_presets` VALUES (1,8,61,2.00,'Coffee');
/*!40000 ALTER TABLE `expense_presets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '1',
  `expense_description` text,
  `expense_type` enum('Fixed','Daily Spending','Group Expense') DEFAULT NULL,
  PRIMARY KEY (`expense_id`),
  KEY `user_id` (`user_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `budget_groups` (`group_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,1,NULL,'5',5.00,1,'','Daily Spending'),(2,1,NULL,'22',22.00,1,'','Daily Spending'),(3,1,NULL,'2222',2222.00,1,'','Daily Spending'),(4,1,NULL,'55',55.00,1,'','Daily Spending'),(5,1,NULL,'Transport',55.00,1,'','Daily Spending'),(6,1,NULL,'Shopping\nTransport',6.00,1,'','Daily Spending'),(7,1,NULL,'Transport',5.00,1,'','Daily Spending'),(8,1,NULL,'Food\nShopping\nTransport',5.00,1,'','Daily Spending'),(9,1,NULL,'Food\nShopping\nTransport',55.00,1,'','Daily Spending'),(10,1,NULL,'Food\nShopping\nTransport',22.00,1,'','Daily Spending'),(11,1,NULL,'Other',1000.00,1,'','Daily Spending'),(12,1,NULL,'Transport',5.00,1,'','Daily Spending'),(13,1,NULL,'Food\nShopping\nTransport',5555555.00,1,'','Daily Spending'),(14,1,NULL,'Food',2.00,1,'','Daily Spending'),(15,1,NULL,'Food\nShopping\nTransport\nOther',55.00,1,'','Daily Spending');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  `member_role` varchar(20) NOT NULL DEFAULT 'member',
  `joined_at` datetime NOT NULL,
  PRIMARY KEY (`membership_id`),
  KEY `user_id` (`user_id`),
  KEY `group_id` (`group_id`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `memberships_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `budget_groups` (`group_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saving_goals`
--

DROP TABLE IF EXISTS `saving_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saving_goals` (
  `goal_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `goal_name` varchar(100) NOT NULL,
  `target_amount` decimal(10,2) NOT NULL,
  `current_amount` decimal(10,2) DEFAULT '0.00',
  `target_date` date DEFAULT NULL,
  PRIMARY KEY (`goal_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `saving_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saving_goals`
--

LOCK TABLES `saving_goals` WRITE;
/*!40000 ALTER TABLE `saving_goals` DISABLE KEYS */;
INSERT INTO `saving_goals` VALUES (1,25,'Fun Vacation',201991.00,66.00,NULL);
/*!40000 ALTER TABLE `saving_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `email_36` (`email`),
  UNIQUE KEY `email_37` (`email`),
  UNIQUE KEY `email_38` (`email`),
  UNIQUE KEY `email_39` (`email`),
  UNIQUE KEY `email_40` (`email`),
  UNIQUE KEY `email_41` (`email`),
  UNIQUE KEY `email_42` (`email`),
  UNIQUE KEY `email_43` (`email`),
  UNIQUE KEY `email_44` (`email`),
  UNIQUE KEY `email_45` (`email`),
  UNIQUE KEY `email_46` (`email`),
  UNIQUE KEY `email_47` (`email`),
  UNIQUE KEY `email_48` (`email`),
  UNIQUE KEY `email_49` (`email`),
  UNIQUE KEY `email_50` (`email`),
  UNIQUE KEY `email_51` (`email`),
  UNIQUE KEY `email_52` (`email`),
  UNIQUE KEY `email_53` (`email`),
  UNIQUE KEY `email_54` (`email`),
  UNIQUE KEY `email_55` (`email`),
  UNIQUE KEY `email_56` (`email`),
  UNIQUE KEY `email_57` (`email`),
  UNIQUE KEY `email_58` (`email`),
  UNIQUE KEY `email_59` (`email`),
  UNIQUE KEY `email_60` (`email`),
  UNIQUE KEY `email_61` (`email`),
  UNIQUE KEY `email_62` (`email`),
  UNIQUE KEY `email_63` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'chhounvannaksok panha','chhounvannaksokpanhaclone@gmail.com','$2b$10$7Czr1cyDcFVU83KeY2nuPu/fYDyiFm5IKEp8ggYhXJmm4wiVY.tF.'),(2,'Roza Rai','RozaRai@gmail.com','$2b$10$JerkwwVriSU/TIMA5ccziuIyQwZujVYA8EzFnx7oJCGqnK1qVpYla'),(3,'KuyHong','KuyHong@gmail.com','$2b$10$SKWiWhA/p1EXJafklUCiIOliP4QX27jKlPqwp.5uml8.2wAuPMSdC'),(7,'Panha','chhounvannaksokpanhaaclone@gmail.com','$2b$10$l2LAc2W2y9OOm6hT3//t5utY265dC7ZUtK6q2LAwRpkpmdWm59Zey'),(9,'chhounvannaksok panha','chhounvDDannaksokpanhaclone@gmail.com','$2b$10$y9z6C5xPJbs2hHPEmzh2SOda5TIExd31iZ0AzAa8CaIZ17sJne3z6'),(10,'chhounvannaksok panha','chhounvaDnnaksokpanhaclone@gmail.com','$2b$10$DYF4GiXqCg2Y0Km2TMXaCOjZWVB.8cFBniTd28NqlPFjsXDM2M1F6'),(11,'chhounvannaksok panha','chhounvannaksokpanhAAaclone@gmail.com','$2b$10$cAQ5.MAFQ3F0HKDMmQFTteJ08WS9tJd3RKzhgkPvsn/jCpQyRtAlm'),(12,'Hello world','hi@gmail.com','$2b$10$7eLCeCvEhBCNQljp2lAN7ema.ht35f6HDoaMJX/mCJ/fPVJ9Eqzaa'),(13,'chhounvannaksok panha','hii@gmail.com','$2b$10$DIJh4E72B9xZMfyf9gaH0.Y1GrkFqMomhtG81zKRnLCN4KjsZ/yxW'),(14,'ho','h@gmail.com','$2b$10$xX65rKaN5ftgowWhw/jzLusPK24prL4hHP1Bc6M4G/cd6Np06aIgq'),(15,'Panha','hh@gmail.com','$2b$10$c3PrGHs.5/0gMzq8urMYs.BD.y0YVlGGRiQKks8gZVpQF5BMZIXRq'),(16,'1mn','1@gmail.com','$2b$10$7uIdZjWyI7qx5b6UjrWBFuSq9jgYWBqwMo4r/wXUSlAeoXoVOrB/i'),(17,'hehe','hehe@gmail.com','$2b$10$/QctEwU7e9j8hfZGHyVwwuULKGC4IexKtopDKArjuOfUwvomXnZfK'),(18,'Roza Rai','vannaksokpanha.chhoun@student.cadt.edu.kh','$2b$10$t.PeGsvKPygjpylC1OaCgeXgKNXNb74aZMe9rlqwBfS6Y7tuddjFy'),(19,'HAHA','haha@gmail.com','$2b$10$bcb3Q6kre.nuxqJDac1ak.IwroLsorxF5fSsF3UUXlOBmAGyYww6C'),(20,'Hem eamSocheat','cheat@gmail.com','$2b$10$Dh6nws1CplQLBe5088mzteIoGKjD.s2pFjTinzeqLLaAfr5iOc0.2'),(21,'Roza Rai','chhoun@gmail.com','$2b$10$OGemQXyMcX1Cg3rvLaUVi.fvnqVGJYKZetNEoL7.j.wy0SvABNX6y'),(22,'aa','a@gmail.com','$2b$10$gnZR3chWn2JJ2S/qsg766O1mZtAE1wKILrXafcOs1VXBspBEXFAp2'),(23,'Panha','Panha@gmail.com','$2b$10$zl./oAbxGPpbA/YmIC/fduvdHvYweie1p.G0rLTwXZ8vqLjActMpy'),(24,'qqqqqqqqqqqqqqqqqqqqqqqqq','q@gmail.com','$2b$10$5gR9DfTVdFH9G1ULaTz.OuNyCxl8SkPqd0mtr5s2KAR/fLCBwMBYW'),(25,'vv','v@gmail.com','$2b$10$8Ie1en6f4uh4OJb8.MONNeRb8fw.n7nbEWrv38Gl3NomzZg4tJ/3m');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'Budget_Planner'
--

--
-- Dumping routines for database 'Budget_Planner'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-16 11:45:02
