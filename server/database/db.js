require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');

const path = require('path');

// this is theMySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Mosaic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


 //initialize the database on startup:
 //1.create Mosaic database if it doesn't exist
 //2.create all tables from mosaic.sql
 //3.load the sample data from data.sql
async function initializeDatabase() 
{
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true,
        });

        // __dirname is server/database, so go UP TWO levels to project root, then into /database
        const schemaPath = path.join(__dirname, '..', '..', 'database', 'mosaic.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        // mosaic.sql uses CREATE DATABASE/TABLE IF NOT EXISTS, so running this every startup is safe
        console.log('Ensuring database schema exists...');
        await connection.query(schemaSQL);
        console.log('✓ Database schema ready');

        await connection.query('USE Mosaic');
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM Workspace');

        if (rows[0].count === 0) {
            const dataPath = path.join(__dirname, '..', '..', 'database', 'data.sql');
            const dataSQL = fs.readFileSync(dataPath, 'utf8');

            console.log('No existing data found — seeding sample data...');
            await connection.query(dataSQL);
            console.log('✓ Sample data loaded');
        } else {
            console.log(`✓ Found ${rows[0].count} existing workspace(s) — keeping existing data, skipping sample seed`);
        }

        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

async function getConnection() {
    return pool.getConnection();
}

async function query(sql, params = []) {
    const connection = await getConnection();

    try {
        const [results] = await connection.execute(sql, params);
        return results;

    } finally {

        connection.release();
    }
}

async function closePool() {
    await pool.end();
}

module.exports = {
    pool,
    getConnection,
    query,
    initializeDatabase,
    closePool,
};

