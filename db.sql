DROP DATABASE IF EXISTS MedNet;
CREATE DATABASE MedNet;
USE MedNet;

-- 1. User Accounts
CREATE TABLE user_account (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Doctor', 'Assistant', 'Patient') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Table
CREATE TABLE admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 3. Doctors
CREATE TABLE doctor (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_available TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 4. Patients
CREATE TABLE patient (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    blood_group VARCHAR(5),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    FOREIGN KEY (user_id) REFERENCES user_account(user_id) ON DELETE CASCADE
);

-- 5. Appointments
CREATE TABLE appointment (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    appointment_date DATETIME,
    status ENUM('Pending', 'Confirmed', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- 6. Prescriptions & Pharmacy
CREATE TABLE prescription (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT UNIQUE,
    diagnosis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
);

CREATE TABLE medicine (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    reorder_level INT DEFAULT 20
);

CREATE TABLE prescription_items (
    prescription_id INT,
    medicine_id INT,
    dosage_instruction VARCHAR(255),
    quantity_prescribed INT,
    PRIMARY KEY (prescription_id, medicine_id),
    FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id),
    FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
);

-- 7. Invoices (The Billing Module)
CREATE TABLE invoice (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT UNIQUE,
    patient_id INT,
    consultation_total DECIMAL(10, 2),
    medicine_total DECIMAL(10, 2),
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
);



-- Populating
-- 1. Create User Accounts (Generated IDs: 1, 2, 3, 4)
INSERT INTO user_account (username, email, password_hash, role) VALUES 
('admin_afridi', 'admin@mednet.com', 'password123', 'Admin'),      -- ID 1
('dr_sam', 'sam@mednet.com', 'password123', 'Doctor'),            -- ID 2
('assistant_rahul', 'rahul@mednet.com', 'password123', 'Assistant'), -- ID 3
('patient_mohammad', 'mohammad@gmail.com', 'password123', 'Patient'); -- ID 4

-- 2. Populate Profiles (Linking to User IDs)
INSERT INTO admin (user_id, name) VALUES (1, 'Md Afridi Hossain');

INSERT INTO doctor (user_id, name, specialization, consultation_fee, is_available) 
VALUES (2, 'Dr. Mohammad Sam Aahem', 'Cardiology', 1000.00, 1);

INSERT INTO patient (user_id, name, date_of_birth, blood_group, height, weight) 
VALUES (4, 'Mohammad Sam Aahem', '1995-05-20', 'O+', 175.5, 78.2);

-- 3. Populate Pharmacy Inventory (Includes Low Stock for Admin Alert)
INSERT INTO medicine (name, price_per_unit, stock_quantity, reorder_level) VALUES 
('Atorvastatin 20mg', 15.50, 100, 20),
('Metformin 850mg', 8.00, 50, 15),
('Amoxicillin 250mg', 12.00, 5, 20), -- Trigger: Low Stock Alert
('Omeprazole 20mg', 10.00, 200, 30);

-- 4. Create an Appointment (Patient 1, Doctor 1)
INSERT INTO appointment (patient_id, doctor_id, appointment_date, status) 
VALUES (1, 1, '2026-05-01 10:00:00', 'Confirmed');

-- 5. Create a Digital Prescription (Link to Appointment 1)
INSERT INTO prescription (appointment_id, diagnosis) 
VALUES (1, 'Hypertension and seasonal bacterial infection.');

-- 6. Add Medicines to the Prescription (Prescription 1)
-- Prescribing 2 units of Atorvastatin and 1 unit of Amoxicillin
INSERT INTO prescription_items (prescription_id, medicine_id, dosage_instruction, quantity_prescribed) VALUES 
(1, 1, 'Once daily after dinner', 2),
(1, 3, 'Twice daily for 5 days', 1);

-- 7. Create Sample Invoices (Admin/Billing Module)
-- Invoice for the confirmed appointment
INSERT INTO invoice (appointment_id, patient_id, consultation_total, medicine_total, grand_total, payment_status) 
VALUES (1, 1, 1000.00, 43.00, 1043.00, 'Unpaid');

-- An extra paid invoice to show "Total Revenue" in Admin Stats
INSERT INTO invoice (appointment_id, patient_id, consultation_total, medicine_total, grand_total, payment_status) 
VALUES (NULL, 1, 500.00, 0.00, 500.00, 'Paid');