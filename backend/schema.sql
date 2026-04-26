-- EventFlow Pro database schema (CSE 3120)

CREATE DATABASE IF NOT EXISTS event_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE event_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('organizer', 'participant') NOT NULL DEFAULT 'participant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  title VARCHAR(220) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(180) NOT NULL DEFAULT 'TBA',
  event_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_organizer
    FOREIGN KEY (organizer_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event_participant (event_id, participant_id),
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_registrations_participant
    FOREIGN KEY (participant_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
