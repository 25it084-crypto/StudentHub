-- =====================================================================
-- PRACTICAL 8: MySQL Schema Design & Seed Data
-- Project: StudentHub Portal (Database: studenthub_db)
-- Author: 2nd Year Student (IT/CSE)
-- =====================================================================

-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS studenthub_db;
USE studenthub_db;

-- Step 2: Drop existing tables in reverse order of foreign key dependency
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS students;

-- =====================================================================
-- 1. Students Table (Entity: Student)
-- Normalization: 3NF (Atomic values, no partial or transitive dependencies)
-- =====================================================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(15) NOT NULL,
    course VARCHAR(50) NOT NULL,
    year_of_study INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 2. Events Table (Entity: Campus Event)
-- Normalization: 3NF
-- =====================================================================
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    venue VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL DEFAULT 50,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 3. Registrations Table (Relationship: Student registers for Event)
-- Many-to-Many resolved through associative table with Foreign Keys
-- =====================================================================
CREATE TABLE registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Registered', 'Attended', 'Cancelled') DEFAULT 'Registered',
    
    -- Foreign Key constraints maintaining referential integrity
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) 
        REFERENCES students(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,

    CONSTRAINT fk_event_id FOREIGN KEY (event_id) 
        REFERENCES events(event_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,

    -- Prevent same student registering for the exact same event multiple times
    CONSTRAINT unique_student_event UNIQUE (student_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================================
-- 4. Seed Data (Sample Test Data for Testing)
-- =====================================================================

-- Insert Students
INSERT INTO students (full_name, email, mobile, course, year_of_study) VALUES
('Rahul Sharma', 'rahul.it@charusat.edu.in', '9876543210', 'B.Tech IT', 2),
('Priya Patel', 'priya.ce@charusat.edu.in', '9898989898', 'B.Tech CE', 3),
('Harsh Varma', 'harsh.cse@charusat.edu.in', '9712345678', 'B.Tech CSE', 2),
('Diya Joshi', 'diya.it@charusat.edu.in', '9909090909', 'B.Tech IT', 1),
('Aarav Mehta', 'aarav.mca@charusat.edu.in', '9825012345', 'MCA', 1);

-- Insert Events
INSERT INTO events (title, category, event_date, venue, total_seats, description) VALUES
('Full Stack Web Bootcamp', 'Workshop', '2026-10-25', 'Lab 301, IT Dept', 50, 'Hands-on practical training on modern HTML5, CSS3, JS, PHP and MySQL.'),
('Annual Hackathon 2026', 'Technical', '2026-11-05', 'Central Auditorium', 100, '24-hour coding challenge solving campus automation challenges.'),
('Cloud Computing Seminar', 'Seminar', '2026-11-12', 'Seminar Hall 2', 60, 'Introduction to AWS EC2, S3, Docker, and microservices.'),
('Inter-College Cricket Cup', 'Sports', '2026-11-20', 'University Sports Ground', 30, 'Department-wise cricket tournament.'),
('Spandan Cultural Night', 'Cultural', '2026-12-01', 'Open Air Theatre', 200, 'Music concert, western dance battle, and campus awards night.');

-- Insert Registrations
INSERT INTO registrations (student_id, event_id, status) VALUES
(1, 1, 'Registered'),
(1, 2, 'Registered'),
(2, 1, 'Registered'),
(2, 3, 'Registered'),
(3, 2, 'Registered'),
(4, 4, 'Registered'),
(5, 1, 'Registered');


-- =====================================================================
-- 5. Stored Procedure (Advanced Extension)
-- Procedure to fetch all events registered by a particular student
-- =====================================================================
DROP PROCEDURE IF EXISTS GetStudentRegistrations;

DELIMITER //
CREATE PROCEDURE GetStudentRegistrations(IN p_student_id INT)
BEGIN
    SELECT 
        s.student_id,
        s.full_name AS student_name,
        s.email,
        e.title AS event_title,
        e.category,
        e.event_date,
        e.venue,
        r.registration_date,
        r.status
    FROM registrations r
    INNER JOIN students s ON r.student_id = s.student_id
    INNER JOIN events e ON r.event_id = e.event_id
    WHERE s.student_id = p_student_id
    ORDER BY e.event_date ASC;
END //
DELIMITER ;
