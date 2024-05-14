const { createPool } = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();



const pool  = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();


module.exports.getBooks = async()=>{
    const [rows] = await pool.query("SELECT * FROM books");
    return rows;
}

module.exports.getBook = async(id)=> {
    const [rows] = await pool.query(`
    SELECT *
    FROM books
    where isbn = ?
    `, [id])
    return rows[0];
}  

module.exports.updateBook = async(book, id)=> {
    const {title,author,genre,shelf} = book;
    const [result] = await pool.query(`
    UPDATE books
    SET 
    title = ?,
    author=?,
    genre=?,
    shelf=?
    WHERE isbn = ?    
    `, [title,author,genre,shelf, id]);
    return this.getBook(id);
}

module.exports.createBook = async(book)=>{

    const [result] = await pool.query(`
    INSERT INTO books (title, author, genre, shelf)
    VALUES (?, ?, ?, ?)
    `, [book.title, book.author, book.genre, book.shelf])
    // console.log(result)
    const id = result.insertId
    return this.getBook(id);
}

module.exports.deleteBook = async(id)=>{
    const [result] = await pool.query(`
    DELETE
    FROM
    books
    WHERE isbn=?
    `, [id])
}
