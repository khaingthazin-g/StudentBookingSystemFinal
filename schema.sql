-- Tutor Booking System Database Schema


CREATE DATABASE IF NOT EXISTS tutor_booking;
USE tutor_booking;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutors table
CREATE TABLE IF NOT EXISTS Tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2),
    imageUrl TEXT
);

-- Appointments table
CREATE TABLE IF NOT EXISTS Appointments (
    id VARCHAR(50) PRIMARY KEY,
    studentId INT,
    studentName VARCHAR(255),
    tutorId VARCHAR(50),
    tutorName VARCHAR(255),
    subject VARCHAR(255),
    date VARCHAR(20),
    time VARCHAR(20),
    message TEXT,
    status ENUM('Pending', 'Approved', 'Cancelled') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'approved', 'cancelled', 'info') DEFAULT 'info',
    isRead TINYINT(1) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);


