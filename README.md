# ReadMore

**ReadMore** is an online platform designed for avid readers to catalog and document their reading journey. Built using the EJS templating language with a Node.js backend powered by Express and MongoDB, this application helps you discover and organize books effortlessly.

## Features

- **Book Cataloging**: Easily search for books and add them to your personalized shelves.
- **Notes and Summaries**: Jot down insights and summaries for each book to enrich your reading experience.
- **Community Connection**: Engage with like-minded book lovers by seeing what others are reading.

## Description

**Welcome to Your Ultimate Book Catalog!**  
Discover a world of books at your fingertips! Our platform is designed to help you effortlessly catalog your reading journey. Whether you're an avid reader or just starting out, you can easily search for books and organize them into personalized shelves.

Not only can you keep track of your literary adventures, but you can also jot down notes or summaries for each title, ensuring that the insights and lessons you gain are never forgotten. Dive into your reading experience, connect with like-minded book lovers, and make your reading journey truly memorable. Start building your bookshelf today!

## Technologies Used

- Node.js
- Express
- MongoDB
- EJS

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB database

### Installation for running locally

1. Clone the repository: <br>
<code> git clone https://github.com/StephenHaugland/ReadMore.git </code>

2. Navigate to the project directory: <br>
   <code>cd readmore</code>

3. Install dependencies: <br>
<code> npm install </code>


4. Set up your MongoDB database and modify/create the .env file <br>

    <code>DB_URL='mongodb://localhost:27017/read-more';
NODE_ENV='dev'
PORT='3000'
SECRET='makethisabettersecret'
API_KEY = '' </code>

6. Modify app.js <br>
   Comment out the following lines to allow cookies to run properly on localhost <br>
<code>// sameSite: 'None',
// secure: true, </code>

7. Start the application: <br>
  <code> npm start </code>

8. Open your browser and go to http://localhost:3000 to start using the application.


Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Inspired by the love of reading and the desire to grow with life long learning through literature.
