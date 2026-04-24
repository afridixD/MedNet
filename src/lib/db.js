import mysql from 'mysql2/promise';

// Using a Singleton pattern for the pool to ensure 
// we don't create multiple pools during Fast Refresh in development.
let pool;

if (!pool) {
  pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'MedNet',
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your expected traffic
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
}

export const db = pool;