CREATE DATABASE read_more;
USE read_more;

CREATE TABLE books (
    isbn integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO books (title, author)
VALUES
('The Great Divorce', 'C.S. Lewis'),
('The Fellowship of the Ring', 'J.R.R Tolkien');