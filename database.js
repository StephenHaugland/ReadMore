import { createPool } from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// const pool  = createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'read_more'
// }).promise();

const pool  = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

// console.log(pool);

export async function getBooks(){
    const [rows] = await pool.query("SELECT * FROM books");
    return rows;
}

export async function getBook(id) {
    

    const [rows] = await pool.query(`
    SELECT *
    FROM books
    where isbn = ?
    `, [id])
    return rows[0];
}  

export async function createBook(title,author){
    const [result] = await pool.query(`
    INSERT INTO books (title, author)
    VALUES (?, ?)
    `, [title, author])
    const id = result.insertId
    return getBook(id);
}

// const result = await createBook('book5', 'Deep Writer');
// console.log(result);

// const books = await getBook(1);
// console.log(books);