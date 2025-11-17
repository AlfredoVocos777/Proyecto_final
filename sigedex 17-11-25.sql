-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: sigedex
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auditoria_sistema`
--

DROP TABLE IF EXISTS `auditoria_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_sistema` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `accion` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_origen` varchar(50) DEFAULT NULL,
  `nivel` enum('info','warning','error') DEFAULT 'info',
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `auditoria_sistema_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_sistema`
--

LOCK TABLES `auditoria_sistema` WRITE;
/*!40000 ALTER TABLE `auditoria_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas_en_tiempo_real`
--

DROP TABLE IF EXISTS `consultas_en_tiempo_real`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas_en_tiempo_real` (
  `id_consulta` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int DEFAULT NULL,
  `id_usuario_emisor` int DEFAULT NULL,
  `id_usuario_receptor` int DEFAULT NULL,
  `mensaje` text,
  `fecha_envio` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','respondida','cerrada') DEFAULT 'pendiente',
  `canal_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_consulta`),
  KEY `id_expediente` (`id_expediente`),
  KEY `id_usuario_emisor` (`id_usuario_emisor`),
  KEY `id_usuario_receptor` (`id_usuario_receptor`),
  CONSTRAINT `consultas_en_tiempo_real_ibfk_1` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`) ON DELETE CASCADE,
  CONSTRAINT `consultas_en_tiempo_real_ibfk_2` FOREIGN KEY (`id_usuario_emisor`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `consultas_en_tiempo_real_ibfk_3` FOREIGN KEY (`id_usuario_receptor`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas_en_tiempo_real`
--

LOCK TABLES `consultas_en_tiempo_real` WRITE;
/*!40000 ALTER TABLE `consultas_en_tiempo_real` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas_en_tiempo_real` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id_departamento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (2,'Recursos Hídricos','Gestión y control de recursos hídricos provinciales'),(3,'Administración','Gestión administrativa y financiera'),(4,'Obras','Planificación y ejecución de obras hídricas'),(5,'Legal','Asesoramiento jurídico y legal'),(6,'Sistemas','Tecnología de la información y sistemas');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `fecha_subida` datetime NOT NULL,
  `subido_por` int NOT NULL,
  `tamaño_archivo` bigint DEFAULT NULL,
  `hash_integridad` varchar(255) DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  KEY `id_expediente` (`id_expediente`),
  KEY `subido_por` (`subido_por`),
  CONSTRAINT `documentos_ibfk_1` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`) ON DELETE CASCADE,
  CONSTRAINT `documentos_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos`
--

LOCK TABLES `documentos` WRITE;
/*!40000 ALTER TABLE `documentos` DISABLE KEYS */;
INSERT INTO `documentos` VALUES (1,32,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762259632252-771237369.pdf','2025-11-04 09:33:52',1,23205,NULL,NULL),(2,32,'Siniestro.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762259717471-267224777.pdf','2025-11-04 09:35:17',1,9641,NULL,NULL),(3,32,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762259846354-168453057.pdf','2025-11-04 09:37:26',1,86009,NULL,NULL),(4,33,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762260053608-605079646.pdf','2025-11-04 09:40:54',1,23205,NULL,NULL),(5,33,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762260363663-279348911.pdf','2025-11-04 09:46:04',1,23205,NULL,NULL),(6,33,'Conformidad Automotor.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762260373685-896110079.pdf','2025-11-04 09:46:14',1,66966,NULL,NULL),(12,35,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261058146-332411904.pdf','2025-11-04 09:57:47',1,86009,NULL,NULL),(13,35,'Siniestro.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261058153-403852094.pdf','2025-11-04 09:57:47',1,9641,NULL,NULL),(14,35,'APCertifAut1Web.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261058153-262676596.pdf','2025-11-04 09:57:47',1,67948,NULL,NULL),(15,35,'Conformidad Automotor.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261058155-452220719.pdf','2025-11-04 09:57:47',1,66966,NULL,NULL),(16,36,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261268011-459112934.pdf','2025-11-04 10:01:21',1,23205,NULL,NULL),(17,36,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261268012-87916140.pdf','2025-11-04 10:01:21',1,86009,NULL,NULL),(18,36,'Siniestro.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261268021-984948438.pdf','2025-11-04 10:01:21',1,9641,NULL,NULL),(19,36,'APCertifAut1Web.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261268021-800576390.pdf','2025-11-04 10:01:21',1,67948,NULL,NULL),(20,38,'APCertifAut1Web.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261713948-489178288.pdf','2025-11-04 10:44:28',1,67948,NULL,NULL),(21,38,'Conformidad Automotor.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762261713950-244263301.pdf','2025-11-04 10:44:28',1,66966,NULL,NULL),(22,39,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762263966545-359442606.pdf','2025-11-04 10:46:19',1,23205,NULL,NULL),(23,39,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762263966546-830367054.pdf','2025-11-04 10:46:19',1,86009,NULL,NULL),(24,40,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762265155034-347200729.pdf','2025-11-04 11:06:17',1,23205,NULL,NULL),(25,40,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762265155035-628122947.pdf','2025-11-04 11:06:17',1,86009,NULL,NULL),(26,42,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762276082855-153824106.pdf','2025-11-04 14:08:06',1,86009,NULL,NULL),(27,43,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762276878273-398496752.pdf','2025-11-04 14:21:23',1,23205,NULL,NULL),(28,44,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762277129281-303173071.pdf','2025-11-04 14:25:32',1,23205,NULL,NULL),(29,45,'AFIP - AdministraciÃ³n Federal de Ingresos PÃºblicos (1) (5).pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762277268877-498594800.pdf','2025-11-04 14:27:51',1,23205,NULL,NULL),(30,45,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762277268878-568584042.pdf','2025-11-04 14:27:51',1,86009,NULL,NULL),(31,46,'20260296435_011_00001_00000037.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\files-1762277801088-433846534.pdf','2025-11-04 14:36:43',1,86009,NULL,NULL),(33,41,'Roldan Certificado Hermana.pdf','application/pdf','C:\\Juan Manuel\\TUP\\Progamacion 4\\GitHub - PF\\Proyecto_final\\backEnd\\uploads\\archivo-1762970418767-79261116.pdf','2025-11-12 15:00:19',5,509158,NULL,NULL),(34,51,'8fcf01c3-1764-4542-87bb-bdc8f3373301.jpeg','image/jpeg','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763306388657-921306308.jpeg','2025-11-16 13:40:59',1,211805,NULL,1),(35,51,'UNIDAD-N-8-Reportes-Indicadores-y-Estadisticas.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326395932-539903943.pdf','2025-11-16 17:53:16',1,4694365,NULL,NULL),(36,51,'Documentacion (2) (1).pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326522247-475302057.pdf','2025-11-16 17:55:22',1,38480,NULL,NULL),(37,51,'ResoluciÃ³n 2309.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326544353-878167368.pdf','2025-11-16 17:55:44',1,896310,NULL,NULL),(38,51,'UNIDAD-N-8-Reportes-Indicadores-y-Estadisticas.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326772029-724682823.pdf','2025-11-16 17:59:32',1,4694365,NULL,NULL),(39,51,'ð¥¦ MODELO DE NEGOCIO BASADO EN ANÃLISIS DE DATOS (3).docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326794288-719120965.docx','2025-11-16 17:59:54',1,1370970,NULL,NULL),(40,51,'Distribucion_Ventas_por_Zona.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763326794310-421890548.docx','2025-11-16 17:59:54',1,88908,NULL,NULL),(41,51,'UNIDAD-N-8-Reportes-Indicadores-y-Estadisticas.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763328310693-289050653.pdf','2025-11-16 18:25:11',1,4694365,NULL,NULL),(42,46,'ResoluciÃ³n 2309.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763328332045-271610782.pdf','2025-11-16 18:25:32',1,896310,NULL,NULL),(43,51,'im2.png','image/png','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763329124679-671824772.png','2025-11-16 18:38:45',1,3844040,NULL,NULL),(44,51,'Documentacion (1) (1).pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763329143470-706281585.pdf','2025-11-16 18:39:03',1,38550,NULL,NULL),(45,47,'Sigedex - Metodologia.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763329218949-271217031.docx','2025-11-16 18:40:19',1,48538,NULL,NULL),(46,47,'UNIDAD-N-8-Reportes-Indicadores-y-Estadisticas.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763329458970-303911774.pdf','2025-11-16 18:44:19',1,4694365,NULL,NULL),(47,47,'ResoluciÃ³n 2309.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763330016040-181216854.pdf','2025-11-16 18:53:36',1,896310,NULL,NULL),(48,45,'ResoluciÃ³n 2309.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763330078987-767540414.pdf','2025-11-16 18:54:39',1,896310,NULL,NULL),(49,47,'Distribucion_Ventas_por_Zona.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763330635455-288822131.docx','2025-11-16 19:03:55',1,88908,NULL,NULL),(50,47,'Documentacion (1) (1).pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763331781680-959313361.pdf','2025-11-16 19:23:02',1,38550,NULL,NULL),(51,51,'Informe_Unidad_8_Jira.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\archivo-1763333753761-51754891.docx','2025-11-16 19:55:54',5,1156372,NULL,NULL),(52,51,'UD_2.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\archivo-1763333826302-12258051.pdf','2025-11-16 19:57:06',5,241946,NULL,NULL),(53,51,'TP_Poker_Planning_ TP5[1].docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\archivo-1763337068020-705512134.docx','2025-11-16 20:51:08',5,9693,NULL,NULL),(54,52,'UNIDAD-N-8-Reportes-Indicadores-y-Estadisticas.pdf','application/pdf','E:\\Documentos\\Facu Alfredo\\TUP\\Programacion 4\\Proyecto_final\\backEnd\\uploads\\files-1763359189550-281345000.pdf','2025-11-17 03:00:21',1,4694365,NULL,1);
/*!40000 ALTER TABLE `documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expedientes`
--

DROP TABLE IF EXISTS `expedientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expedientes` (
  `id_expediente` int NOT NULL AUTO_INCREMENT,
  `numero_expediente` varchar(50) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `estado_actual` enum('en revisión','aprobado','rechazado','archivado') DEFAULT 'en revisión',
  `id_usuario_presentante` int DEFAULT NULL,
  `id_profesional_asignado` int DEFAULT NULL,
  `tipo_expediente` varchar(50) DEFAULT NULL,
  `descripcion` longtext,
  `fecha_cierre` datetime DEFAULT NULL,
  `prioridad` enum('alta','media','baja') DEFAULT 'media',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ubicacion` varchar(255) DEFAULT NULL,
  `confirmar_pago` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_expediente`),
  UNIQUE KEY `numero_expediente` (`numero_expediente`),
  KEY `id_usuario_presentante` (`id_usuario_presentante`),
  KEY `id_profesional_asignado` (`id_profesional_asignado`),
  CONSTRAINT `expedientes_ibfk_1` FOREIGN KEY (`id_usuario_presentante`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `expedientes_ibfk_2` FOREIGN KEY (`id_profesional_asignado`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expedientes`
--

LOCK TABLES `expedientes` WRITE;
/*!40000 ALTER TABLE `expedientes` DISABLE KEYS */;
INSERT INTO `expedientes` VALUES (1,'2025/0001','2025-10-29 15:19:56','en revisión',1,NULL,'Obra nueva','nose',NULL,'media','2025-10-29 18:19:56','2025-10-29 18:19:56',NULL,NULL),(2,'2025/0002','2025-10-29 15:57:35','en revisión',1,NULL,'Obra nueva','fdhhfh',NULL,'media','2025-10-29 18:57:35','2025-10-29 18:57:35',NULL,NULL),(3,'2025/0003','2025-10-30 15:35:24','en revisión',1,NULL,'Obra nueva','fdefds',NULL,'media','2025-10-30 18:35:24','2025-10-30 18:35:24',NULL,NULL),(4,'2025/0004','2025-10-30 15:41:36','en revisión',1,NULL,'Obra nueva','ghert',NULL,'media','2025-10-30 18:41:36','2025-10-30 18:41:36',NULL,NULL),(5,'2025/0005','2025-10-30 15:41:51','en revisión',1,NULL,'Obra nueva','ghert',NULL,'media','2025-10-30 18:41:51','2025-10-30 18:41:51',NULL,NULL),(6,'2025/0006','2025-10-30 15:42:00','en revisión',1,NULL,'Obra nueva','ghert',NULL,'media','2025-10-30 18:42:00','2025-10-30 18:42:00',NULL,NULL),(7,'2025/0007','2025-10-30 15:44:02','en revisión',1,NULL,'Obra nueva','ghert',NULL,'media','2025-10-30 18:44:02','2025-10-30 18:44:02',NULL,NULL),(8,'2025/0008','2025-10-30 15:44:14','en revisión',1,NULL,'Obra nueva','ghert',NULL,'media','2025-10-30 18:44:14','2025-10-30 18:44:14',NULL,NULL),(9,'2025/0009','2025-11-03 13:00:04','en revisión',1,NULL,'Rivera','fdsf',NULL,'media','2025-11-03 16:00:04','2025-11-03 16:00:04',NULL,NULL),(11,'2025/0010','2025-11-03 13:05:31','en revisión',1,NULL,'Obra nueva','dsg',NULL,'media','2025-11-03 16:05:31','2025-11-03 16:05:31',NULL,NULL),(12,'2025/0011','2025-11-03 13:05:36','en revisión',1,NULL,'Obra nueva','dsg',NULL,'media','2025-11-03 16:05:36','2025-11-03 16:05:36',NULL,NULL),(13,'2025/0012','2025-11-03 13:06:04','en revisión',1,NULL,'Obra nueva','dsg',NULL,'media','2025-11-03 16:06:04','2025-11-03 16:06:04',NULL,NULL),(14,'2025/0013','2025-11-03 13:06:46','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-03 16:06:46','2025-11-03 16:06:46',NULL,NULL),(15,'2025/0014','2025-11-04 08:00:34','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-04 11:00:34','2025-11-04 11:00:34',NULL,NULL),(16,'2025/0015','2025-11-04 08:21:26','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-04 11:21:26','2025-11-04 11:21:26',NULL,NULL),(17,'2025/0016','2025-11-04 08:21:31','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-04 11:21:31','2025-11-04 11:21:31',NULL,NULL),(18,'2025/0017','2025-11-04 08:22:53','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-04 11:22:53','2025-11-04 11:22:53',NULL,NULL),(19,'2025/0018','2025-11-04 08:31:58','en revisión',1,NULL,'Rivera','fedfdsf',NULL,'media','2025-11-04 11:31:58','2025-11-04 11:31:58',NULL,NULL),(20,'2025/0019','2025-11-04 08:32:22','en revisión',1,NULL,'Obra nueva','hola',NULL,'media','2025-11-04 11:32:22','2025-11-04 11:32:22',NULL,NULL),(21,'2025/0020','2025-11-04 08:32:47','en revisión',1,NULL,'Obra nueva','fghfgh',NULL,'media','2025-11-04 11:32:47','2025-11-04 11:32:47',NULL,NULL),(22,'2025/0021','2025-11-04 08:33:15','en revisión',1,NULL,'Rivera','thrgfh',NULL,'media','2025-11-04 11:33:15','2025-11-04 11:33:15',NULL,NULL),(23,'2025/0022','2025-11-04 08:33:58','en revisión',1,NULL,'Obra nueva','ghdf',NULL,'media','2025-11-04 11:33:58','2025-11-04 11:33:58',NULL,NULL),(24,'2025/0023','2025-11-04 08:36:49','en revisión',1,NULL,'Obra nueva','hola\n',NULL,'media','2025-11-04 11:36:49','2025-11-04 11:36:49',NULL,NULL),(25,'2025/0024','2025-11-04 08:43:10','en revisión',1,NULL,'Obra nueva','hyjt',NULL,'media','2025-11-04 11:43:10','2025-11-04 11:43:10',NULL,NULL),(26,'2025/0025','2025-11-04 08:47:01','en revisión',1,NULL,'Obra nueva','dsad',NULL,'media','2025-11-04 11:47:01','2025-11-04 11:47:01',NULL,NULL),(27,'2025/0026','2025-11-04 09:00:56','en revisión',1,NULL,'Obra nueva','scdafd',NULL,'media','2025-11-04 12:00:56','2025-11-04 12:00:56',NULL,NULL),(28,'2025/0027','2025-11-04 09:11:59','en revisión',1,NULL,'Obra nueva','sdf',NULL,'media','2025-11-04 12:11:59','2025-11-04 12:11:59',NULL,NULL),(29,'2025/0028','2025-11-04 09:16:18','en revisión',1,NULL,'Rivera','fdgdfg',NULL,'media','2025-11-04 12:16:18','2025-11-04 12:16:18',NULL,NULL),(30,'2025/0029','2025-11-04 09:18:19','en revisión',1,NULL,'Obra nueva','gfhfg',NULL,'media','2025-11-04 12:18:19','2025-11-04 12:18:19',NULL,NULL),(31,'2025/0030','2025-11-04 09:32:33','en revisión',1,NULL,'Obra nueva','dfsf',NULL,'media','2025-11-04 12:32:33','2025-11-04 12:32:33',NULL,NULL),(32,'2025/0031','2025-11-04 09:33:40','en revisión',1,NULL,'Obra nueva','dsfs',NULL,'media','2025-11-04 12:33:40','2025-11-04 12:33:40',NULL,NULL),(33,'2025/0032','2025-11-04 09:40:54','en revisión',1,NULL,'Obra nueva','fgnfgjh',NULL,'media','2025-11-04 12:40:54','2025-11-04 12:40:54',NULL,NULL),(34,'2025/0033','2025-11-04 09:49:30','en revisión',1,NULL,'Obra nueva','ewrw',NULL,'media','2025-11-04 12:49:30','2025-11-04 12:49:30',NULL,NULL),(35,'2025/0034','2025-11-04 09:57:38','en revisión',1,NULL,'Rivera','hola',NULL,'media','2025-11-04 12:57:38','2025-11-04 12:57:38',NULL,NULL),(36,'2025/0035','2025-11-04 10:01:08','en revisión',1,NULL,'Obra nueva','dsadas',NULL,'media','2025-11-04 13:01:08','2025-11-04 13:01:08',NULL,NULL),(37,'2025/0036','2025-11-04 10:07:39','en revisión',1,NULL,'Obra nueva','fsfsa',NULL,'media','2025-11-04 13:07:39','2025-11-04 13:07:39',NULL,NULL),(38,'2025/0037','2025-11-04 10:08:34','en revisión',1,NULL,'Obra nueva','fsaf',NULL,'media','2025-11-04 13:08:34','2025-11-04 13:08:34',NULL,NULL),(39,'2025/0038','2025-11-04 10:46:07','en revisión',1,NULL,'Obra nueva','fdsfs',NULL,'media','2025-11-04 13:46:07','2025-11-04 13:46:07',NULL,NULL),(40,'2025/0039','2025-11-04 11:05:55','en revisión',1,NULL,'Obra nueva','linea de rivera',NULL,'media','2025-11-04 14:05:55','2025-11-04 14:05:55',NULL,NULL),(41,'2025/0040','2025-11-04 13:26:06','en revisión',1,NULL,'Obra nueva','fdsf',NULL,'media','2025-11-04 16:26:06','2025-11-04 16:26:06',NULL,NULL),(42,'2025/0041','2025-11-04 14:08:03','en revisión',1,NULL,'Obra nueva','gdsgsd',NULL,'media','2025-11-04 17:08:03','2025-11-04 17:08:03',NULL,NULL),(43,'2025/0042','2025-11-04 14:21:18','en revisión',1,NULL,'Obra nueva','fdgfd',NULL,'media','2025-11-04 17:21:18','2025-11-04 17:21:18',NULL,NULL),(44,'2025/0043','2025-11-04 14:25:29','en revisión',1,NULL,'Obra nueva','dgsgds',NULL,'media','2025-11-04 17:25:29','2025-11-04 17:25:29',NULL,NULL),(45,'2025/0044','2025-11-04 14:27:49','en revisión',1,NULL,'Rivera','fdsfsd',NULL,'media','2025-11-04 17:27:49','2025-11-04 17:27:49',NULL,NULL),(46,'2025/0045','2025-11-04 14:36:41','en revisión',1,NULL,'Obra nueva','dsffds',NULL,'media','2025-11-04 17:36:41','2025-11-04 17:36:41',NULL,NULL),(47,'2025/0046','2025-11-07 11:06:58','aprobado',1,NULL,'Obra nueva','ddf',NULL,'media','2025-11-07 14:06:58','2025-11-13 01:06:53',NULL,NULL),(51,'2025/0047','2025-11-16 13:40:59','en revisión',1,NULL,'Rio','construccion',NULL,'media','2025-11-16 16:40:59','2025-11-16 16:40:59','Banda del Río salí','pago confirmado'),(52,'2025/0048','2025-11-17 03:00:21','en revisión',1,NULL,'Constancia de prefactibilidad de no inundabilidad','casas',NULL,'media','2025-11-17 06:00:21','2025-11-17 06:00:21','Banda del Río salí','pago confirmado');
/*!40000 ALTER TABLE `expedientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmas_digitales`
--

DROP TABLE IF EXISTS `firmas_digitales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `firmas_digitales` (
  `id_firma` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_firma` datetime DEFAULT CURRENT_TIMESTAMP,
  `hash_documento` varchar(255) DEFAULT NULL,
  `metodo_firma` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_firma`),
  KEY `id_expediente` (`id_expediente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `firmas_digitales_ibfk_1` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`),
  CONSTRAINT `firmas_digitales_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmas_digitales`
--

LOCK TABLES `firmas_digitales` WRITE;
/*!40000 ALTER TABLE `firmas_digitales` DISABLE KEYS */;
INSERT INTO `firmas_digitales` VALUES (1,47,1,'2025-11-14 12:21:44',NULL,'SHA256','2025-11-14 15:21:44');
/*!40000 ALTER TABLE `firmas_digitales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_expediente`
--

DROP TABLE IF EXISTS `historial_expediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_expediente` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int NOT NULL,
  `fecha` datetime NOT NULL,
  `accion` varchar(255) DEFAULT NULL,
  `comentario` text,
  `id_usuario_responsable` int DEFAULT NULL,
  `id_departamento` int DEFAULT NULL,
  `tipo_accion` enum('asignación','revisión','firma','observación','cierre') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `id_expediente` (`id_expediente`),
  KEY `id_usuario_responsable` (`id_usuario_responsable`),
  KEY `id_departamento` (`id_departamento`),
  CONSTRAINT `historial_expediente_ibfk_1` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`) ON DELETE CASCADE,
  CONSTRAINT `historial_expediente_ibfk_2` FOREIGN KEY (`id_usuario_responsable`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `historial_expediente_ibfk_3` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_expediente`
--

LOCK TABLES `historial_expediente` WRITE;
/*!40000 ALTER TABLE `historial_expediente` DISABLE KEYS */;
INSERT INTO `historial_expediente` VALUES (1,47,'2025-11-12 14:09:30','Asignación administrativa','Asignado por administrador',3,NULL,'asignación','2025-11-12 17:09:29'),(2,47,'2025-11-12 14:21:42','Recepción de expediente','Expediente recepcionado',3,NULL,'revisión','2025-11-12 17:21:42'),(3,46,'2025-11-12 14:43:35','Asignación administrativa','Asignado por administrador',6,NULL,'asignación','2025-11-12 17:43:35'),(4,41,'2025-11-12 15:00:19','Carga de documento','Se subió el archivo: Roldan Certificado Hermana.pdf',5,NULL,'observación','2025-11-12 18:00:18'),(5,47,'2025-11-12 21:50:53','Asignación administrativa','Asignado por administrador',7,NULL,'asignación','2025-11-13 00:50:52'),(6,47,'2025-11-12 21:52:23','Recepción por Dirección','Expediente recepcionado por el Director',7,NULL,'revisión','2025-11-13 00:52:22'),(7,47,'2025-11-12 22:07:08','Recepción por Dirección','aprobar',7,NULL,'revisión','2025-11-13 01:07:08'),(8,47,'2025-11-12 22:44:55','Recepción por Dirección','listo',7,NULL,'revisión','2025-11-13 01:44:55'),(9,46,'2025-11-12 22:59:03','Asignación administrativa','Asignado por administrador',6,NULL,'asignación','2025-11-13 01:59:03');
/*!40000 ALTER TABLE `historial_expediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `id_expediente` int DEFAULT NULL,
  `accion` varchar(255) DEFAULT NULL,
  `descripcion` text,
  `fecha_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  `nivel` enum('info','warning','error') DEFAULT 'info',
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_expediente` (`id_expediente`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `mensaje` text,
  `tipo` varchar(50) DEFAULT NULL,
  `fecha_envio` datetime DEFAULT CURRENT_TIMESTAMP,
  `leida` tinyint(1) DEFAULT '0',
  `canal` enum('sistema','email','push') DEFAULT 'sistema',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observaciones`
--

DROP TABLE IF EXISTS `observaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `observaciones` (
  `id_observacion` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `rol` enum('admin','tecnico','juridico','director') NOT NULL,
  `observacion` text,
  `fecha_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','revisada','cerrada') DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_observacion`),
  KEY `id_expediente` (`id_expediente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `observaciones_ibfk_1` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`),
  CONSTRAINT `observaciones_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observaciones`
--

LOCK TABLES `observaciones` WRITE;
/*!40000 ALTER TABLE `observaciones` DISABLE KEYS */;
INSERT INTO `observaciones` VALUES (1,51,5,'admin','todo correcto','2025-11-16 22:07:19','pendiente','2025-11-17 01:07:19','2025-11-17 01:07:19');
/*!40000 ALTER TABLE `observaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_expediente` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `estado_pago` enum('pendiente','confirmado','fallido') DEFAULT 'pendiente',
  `referencia_pasarela` varchar(255) DEFAULT NULL COMMENT 'ID de confirmación devuelto por la pasarela',
  PRIMARY KEY (`id_pago`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_expediente` (`id_expediente`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,1,9,5000.00,'2025-11-03 13:00:04','otros','confirmado','67890'),(2,1,19,5000.00,'2025-11-04 08:31:57','otros','confirmado','SIMULADO-1762255917675'),(3,1,20,5000.00,'2025-11-04 08:32:22','otros','confirmado','SIMULADO-1762255942096'),(4,1,21,5000.00,'2025-11-04 08:32:46','otros','confirmado','SIMULADO-1762255966894'),(5,1,22,5000.00,'2025-11-04 08:33:14','otros','confirmado','SIMULADO-1762255994828'),(6,1,23,5000.00,'2025-11-04 08:33:57','otros','confirmado','SIMULADO-1762256037933'),(7,1,24,5000.00,'2025-11-04 08:36:48','otros','confirmado','SIMULADO-1762256208678'),(8,1,25,5000.00,'2025-11-04 08:43:10','otros','confirmado','SIMULADO-1762256590158'),(9,1,26,5000.00,'2025-11-04 08:47:00','otros','confirmado','SIMULADO-1762256820794'),(10,1,27,5000.00,'2025-11-04 09:00:56','otros','confirmado','SIMULADO-1762257656056'),(11,1,28,5000.00,'2025-11-04 09:11:58','otros','confirmado','SIMULADO-1762258318556'),(12,1,29,5000.00,'2025-11-04 09:16:18','otros','confirmado','SIMULADO-1762258578280'),(13,1,30,5000.00,'2025-11-04 09:18:19','otros','confirmado','SIMULADO-1762258699082'),(14,1,31,5000.00,'2025-11-04 09:32:32','otros','confirmado','SIMULADO-1762259552894'),(15,1,32,5000.00,'2025-11-04 09:40:31','otros','confirmado','SIMULADO-1762260031298'),(16,1,33,5000.00,'2025-11-04 09:46:25','otros','confirmado','SIMULADO-1762260385485'),(17,1,34,5000.00,'2025-11-04 09:56:39','otros','confirmado','SIMULADO-1762260999157'),(18,1,35,5000.00,'2025-11-04 09:57:46','otros','confirmado','SIMULADO-1762261066548'),(19,1,36,5000.00,'2025-11-04 10:01:21','otros','confirmado','SIMULADO-1762261281153'),(20,1,37,5000.00,'2025-11-04 10:07:41','otros','confirmado','SIMULADO-1762261661316'),(21,1,38,5000.00,'2025-11-04 10:44:27','otros','confirmado','SIMULADO-1762263867663'),(22,1,39,5000.00,'2025-11-04 10:46:18','otros','confirmado','SIMULADO-1762263978797'),(23,1,40,5000.00,'2025-11-04 11:06:16','otros','confirmado','SIMULADO-1762265176861'),(24,1,41,5000.00,'2025-11-04 13:26:10','otros','confirmado','SIMULADO-1762273570162'),(25,1,42,5000.00,'2025-11-04 14:08:05','otros','confirmado','SIMULADO-1762276085816'),(26,1,43,5000.00,'2025-11-04 14:21:22','otros','confirmado','SIMULADO-1762276882934'),(27,1,44,5000.00,'2025-11-04 14:25:31','otros','confirmado','SIMULADO-1762277131570'),(28,1,45,5000.00,'2025-11-04 14:27:51','otros','confirmado','SIMULADO-1762277271488'),(29,1,46,5000.00,'2025-11-04 14:36:43','otros','confirmado','SIMULADO-1762277803337'),(30,1,47,5000.00,'2025-11-07 11:07:02','otros','confirmado','SIMULADO-1762524422723'),(33,1,51,5000.00,'2025-11-16 13:40:59','mercadopago','confirmado','SIMULADO-MP-1763311259178'),(34,1,52,5000.00,'2025-11-17 03:00:21','mercadopago','confirmado','SIMULADO-MP-1763359220730');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (78,'crear_usuario','Permite crear nuevos usuarios en el sistema'),(79,'editar_usuario','Permite modificar datos de usuarios existentes'),(80,'eliminar_usuario','Permite eliminar usuarios del sistema'),(81,'ver_usuarios','Permite ver el listado de usuarios'),(82,'crear_expediente','Permite crear nuevos expedientes'),(83,'editar_expediente','Permite modificar expedientes existentes'),(84,'archivar_expediente','Permite archivar expedientes'),(85,'ver_expedientes','Permite ver expedientes'),(86,'crear_tramite','Permite crear nuevos trámites'),(87,'gestionar_pagos','Permite gestionar pagos de trámites'),(88,'firmar_digitalmente','Permite realizar firmas digitales'),(89,'gestionar_roles','Permite crear y modificar roles'),(90,'gestionar_permisos','Permite crear y modificar permisos'),(91,'gestionar_departamentos','Permite crear y modificar departamentos'),(92,'ver_reportes','Permite visualizar reportes del sistema'),(93,'configurar_sistema','Permite modificar configuraciones del sistema'),(94,'realizar_pase','Permite realizar pases de expedientes entre áreas/departamentos'),(95,'deshacer_pase','Permite deshacer pases de expedientes realizados previamente'),(96,'consultar_expediente_detalle','Permite consultar el detalle completo de un expediente'),(97,'recepcion_pase','Permite recepcionar expedientes y realizar pases'),(98,'rechazar_recepcion','Permite rechazar la recepción de expedientes'),(99,'ver_manual_usuario','Permite acceder al manual de usuario del sistema');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permisos`
--

DROP TABLE IF EXISTS `rol_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permisos` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `rol_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permisos`
--

LOCK TABLES `rol_permisos` WRITE;
/*!40000 ALTER TABLE `rol_permisos` DISABLE KEYS */;
INSERT INTO `rol_permisos` VALUES (30,78),(33,78),(30,79),(30,80),(30,81),(31,81),(33,81),(28,82),(30,82),(28,83),(29,83),(30,83),(30,84),(31,84),(28,85),(29,85),(30,85),(31,85),(32,85),(28,86),(30,86),(32,86),(30,87),(28,88),(29,88),(30,88),(31,88),(30,89),(33,89),(30,90),(33,90),(30,91),(29,92),(30,92),(31,92),(33,92),(30,93),(33,93),(28,94),(29,94),(30,94),(28,95),(29,95),(30,95),(28,96),(29,96),(30,96),(28,97),(29,97),(30,97),(28,98),(29,98),(30,98),(28,99),(29,99),(30,99);
/*!40000 ALTER TABLE `rol_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (28,'Técnico','Personal técnico - puede gestionar expedientes y realizar análisis técnicos'),(29,'Jurídico','Personal legal - puede revisar aspectos legales de expedientes'),(30,'Administrativo','Acceso completo al sistema - puede gestionar usuarios, roles, permisos y todas las funciones administrativas'),(31,'Director','Acceso de dirección - puede ver reportes y aprobar expedientes importantes'),(32,'Presentante','Usuario básico - puede crear trámites y consultar sus expedientes'),(33,'Admin TI','Administrador de sistemas - gestiona aspectos técnicos del sistema');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` int NOT NULL,
  `email` varchar(150) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `tipo_usuario` varchar(20) NOT NULL DEFAULT 'presentante',
  `telefono` varchar(20) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `id_departamento` int DEFAULT NULL,
  `id_rol` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `usuario` varchar(45) NOT NULL,
  `direccion` varchar(45) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `dni_cuit` (`dni`),
  UNIQUE KEY `email` (`email`),
  KEY `usuario_ibfk_1` (`id_departamento`),
  KEY `usuario_ibfk_2` (`id_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`),
  CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Juan','Manuel',29878533,'juan@empresa.com','$2b$10$p15QF38RGRb93fsNAyuXm.5aMAEqLNwTPOPus7K7AFpAkq8rfTcqm','presentante','3814526987','activo',NULL,32,'2025-10-24 13:49:22',NULL,'jmg','Basail 340'),(3,'Chicho','Ponce',123456,'chicho@dpa.com','$2b$10$fa.lvI96ZlHipiZKt2HYDORIDvMNYp8uayUh1FQnG6UyfpXokyFd2','juridico','3816245879','activo',NULL,29,'2025-11-07 14:20:34',NULL,'chicho','4 de junio'),(5,'Alfredo','Vocos',12345678,'admin@dpa.gob.ar','$2b$10$/mv7FR0LnCNJ7yrhOudaceUKHuKbOtR4a1644eZCx.P66aa1su4WC','administrativo','2614000000','activo',NULL,30,'2025-11-12 15:09:05',NULL,'admin','Dirección Provincial del Agua '),(6,'martin','ortiz',121314564,'jesus@dpat.tuc','$2b$10$iwe82cog3Vse9BmrGMp8ReblvWgdxxSxQHu8A1V/cFmx4ZTqIoDhq','técnico','38126134543','activo',NULL,28,'2025-11-12 16:21:43',NULL,'chato','italia 4000'),(7,'Lionel','Messi',25255384,'10@gmail.com','$2b$10$KBXI3BwuvxnwdpM4uj1.nOBWDsXnLsWp9enrVKkag/9b40ZeyiJHW','director','231483902859032','activo',NULL,31,'2025-11-13 00:38:22',NULL,'lio10','rosario');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-17  3:31:37
