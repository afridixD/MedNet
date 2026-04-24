DROP DATABASE IF EXISTS MedNet;
CREATE DATABASE MedNet;
USE MedNet;

-- 1. Departments
CREATE TABLE Department (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL,
    floor_number INT,
    phone_extension VARCHAR(10)
);

-- 2. User Accounts
CREATE TABLE User_Account (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Doctor', 'Assistant', 'Patient') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Doctors
CREATE TABLE Doctor (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    dept_id INT,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);

-- 4. Doctor's Assistants
CREATE TABLE Assistant (
    assistant_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    doctor_id INT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id) ON DELETE SET NULL
);

-- 5. Patients
CREATE TABLE Patient (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    phone VARCHAR(20),
    address TEXT,
    medical_history_emr TEXT,
    allergies TEXT,
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE
);

-- 6. Time Slots
CREATE TABLE Time_Slot (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id) ON DELETE CASCADE
);

-- 7. Appointments
CREATE TABLE Appointment (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
    slot_id INT UNIQUE,
    appointment_date DATE,
    status ENUM('Pending', 'Confirmed', 'Checked-in', 'Completed', 'No-show') DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id),
    FOREIGN KEY (slot_id) REFERENCES Time_Slot(slot_id)
);

-- 8. Prescriptions
CREATE TABLE Prescription (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT UNIQUE,
    diagnosis TEXT,
    soap_subjective TEXT,
    soap_objective TEXT, 
    soap_assessment TEXT, 
    soap_plan TEXT,       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
);

-- 9. Medicines 
CREATE TABLE Medicine (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price_per_unit DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    reorder_level INT DEFAULT 20 
);

-- 10. Prescription Items 
CREATE TABLE Prescription_Items (
    prescription_id INT,
    medicine_id INT,
    dosage_instruction VARCHAR(255),
    quantity_prescribed INT,
    PRIMARY KEY (prescription_id, medicine_id),
    FOREIGN KEY (prescription_id) REFERENCES Prescription(prescription_id),
    FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- 11. Hospital Resources
CREATE TABLE Hospital_Resource (
    resource_id INT PRIMARY KEY AUTO_INCREMENT,
    resource_name VARCHAR(100), 
    type ENUM('Room', 'Equipment', 'Diagnostic'),
    is_available BOOLEAN DEFAULT TRUE,
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);

-- 12. Invoices (Billing & Fees)
CREATE TABLE Invoice (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT UNIQUE,
    patient_id INT,
    consultation_total DECIMAL(10, 2), 
    medicine_total DECIMAL(10, 2),     
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
);