DROP DATABASE IF EXISTS MedNet;
CREATE DATABASE MedNet;
USE MedNet;

-- 1. user_account
CREATE TABLE user_account (
    user_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Doctor', 'Assistant', 'Patient') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. department
CREATE TABLE department (
    dept_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    floor_number INT(11),
    phone_extension VARCHAR(10)
);

-- 3. admin
CREATE TABLE admin (
    admin_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11),
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 4. assistant
CREATE TABLE assistant (
    assistant_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) UNIQUE,
    doctor_id INT(11), -- Will link after doctor table is created
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 5. doctor
CREATE TABLE doctor (
    doctor_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) UNIQUE,
    dept_id INT(11),
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    phone VARCHAR(15),
    email VARCHAR(100),
    assistant_id INT(11),
    is_available TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id),
    FOREIGN KEY (assistant_id) REFERENCES assistant(assistant_id)
);

-- Add the circular FK for Assistant -> Doctor now that doctor exists
ALTER TABLE assistant ADD FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id);

-- 6. patient
CREATE TABLE patient (
    patient_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    user_id INT(11) UNIQUE,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    phone VARCHAR(20),
    address TEXT,
    medical_history_emr TEXT,
    allergies TEXT,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 7. time_slot
CREATE TABLE time_slot (
    slot_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT(11),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_booked TINYINT(1) DEFAULT 0,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE
);

-- 8. appointment
CREATE TABLE appointment (
    appointment_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    patient_id INT(11),
    doctor_id INT(11),
    slot_id INT(11) UNIQUE,
    appointment_date DATETIME,
    status ENUM('Pending', 'Confirmed', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (slot_id) REFERENCES time_slot(slot_id)
);

-- 9. prescription
CREATE TABLE prescription (
    prescription_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT(11) UNIQUE,
    diagnosis TEXT,
    soap_subjective TEXT,
    soap_objective TEXT,
    soap_assessment TEXT,
    soap_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE CASCADE
);

-- 10. medicine
CREATE TABLE medicine (
    medicine_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price_per_unit DECIMAL(10,2) NOT NULL,
    stock_quantity INT(11) NOT NULL,
    reorder_level INT(11) DEFAULT 20
);

-- 11. prescription_items
CREATE TABLE prescription_items (
    prescription_id INT(11),
    medicine_id INT(11),
    dosage_instruction VARCHAR(255),
    quantity_prescribed INT(11),
    PRIMARY KEY (prescription_id, medicine_id),
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
);

-- 12. hospital_resource
CREATE TABLE hospital_resource (
    resource_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    resource_name VARCHAR(100),
    type ENUM('Room', 'Equipment', 'Diagnostic'),
    is_available TINYINT(1) DEFAULT 1,
    dept_id INT(11),
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);

-- 13. invoice
CREATE TABLE invoice (
    invoice_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT(11) UNIQUE,
    patient_id INT(11),
    consultation_total DECIMAL(10,2),
    medicine_total DECIMAL(10,2),
    grand_total DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doctor_id INT(11),
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- Departments
USE MedNet;

-- 1. Departments
INSERT INTO department (dept_name, floor_number, phone_extension) VALUES 
('Cardiology', 3, '101'), 
('Pediatrics', 2, '202');

-- 2. User Accounts (Base Identity)
INSERT INTO user_account (username, email, password_hash, role) VALUES 
('admin_afridi', 'admin@mednet.com', 'password123', 'Admin'),      -- ID 1
('dr_sam', 'sam@mednet.com', 'password123', 'Doctor'),            -- ID 2
('assist_rahul', 'rahul@mednet.com', 'password123', 'Assistant'), -- ID 3
('patient_mohammad', 'mohammad@gmail.com', 'password123', 'Patient'); -- ID 4

-- 3. Admin Profile
INSERT INTO admin (user_id, name) VALUES 
(1, 'Md Afridi Hossain');

-- 4. Assistant Profile
INSERT INTO assistant (user_id, name, phone) VALUES 
(3, 'Rahul Kumar', '01711223344');

-- 5. Doctor Profile
INSERT INTO doctor (user_id, dept_id, name, specialization, consultation_fee, assistant_id) VALUES 
(2, 1, 'Dr. Sam Aahem', 'Cardiology', 1000.00, 1);

-- 6. Patient Profile
INSERT INTO patient (user_id, name, gender, blood_group, weight, height) VALUES 
(4, 'Mohammad Sam Aahem', 'Male', 'O+', 78.2, 175.5);

-- 7. Time Slots
INSERT INTO time_slot (doctor_id, start_time, end_time, is_booked) VALUES 
(1, '2026-05-10 10:00:00', '2026-05-10 10:30:00', 1),
(1, '2026-05-10 11:00:00', '2026-05-10 11:30:00', 0);

-- 8. Appointments
INSERT INTO appointment (patient_id, doctor_id, slot_id, appointment_date, status) VALUES 
(1, 1, 1, '2026-05-10 10:00:00', 'Confirmed');

-- 9. Prescriptions
INSERT INTO prescription (appointment_id, diagnosis, soap_plan) VALUES 
(1, 'Hypertension', 'Daily 30 min walk, reduce sodium intake');

-- 10. Medicines
INSERT INTO medicine (name, category, price_per_unit, stock_quantity) VALUES 
('Atorvastatin 20mg', 'Statin', 15.50, 100),
('Amoxicillin 250mg', 'Antibiotic', 12.00, 50);

-- 11. Prescription Items
INSERT INTO prescription_items (prescription_id, medicine_id, dosage_instruction, quantity_prescribed) VALUES 
(1, 1, 'Once daily after dinner', 30);

-- 12. Hospital Resources
INSERT INTO hospital_resource (resource_name, type, dept_id) VALUES 
('Room 305', 'Room', 1),
('Portable X-Ray', 'Equipment', 2);

-- 13. Invoices
INSERT INTO invoice (appointment_id, patient_id, consultation_total, medicine_total, grand_total, payment_status, doctor_id) VALUES 
(1, 1, 1000.00, 465.00, 1465.00, 'Unpaid', 1);