CREATE DATABASE read_more;
USE read_more;

CREATE TABLE books (
    isbn integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    fic BOOLEAN,
    shelf VARCHAR(255) DEFAULT 'Want to Read',
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO books (title, author,genre, fic, shelf)
VALUES
('The Great Divorce', 'C.S. Lewis', 'Religious', 1, 'read'),
('The Fellowship of the Ring', 'J.R.R Tolkien', 'fantasy', 1, 'read');