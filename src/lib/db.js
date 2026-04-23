// src/lib/db.js
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: 'yourpassword', // Your MySQL password
  database: 'MedNet',
  connectionLimit: 10
});