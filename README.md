# BlogWave: A Comprehensive Blogging Platform

## Overview

BlogWave is a full-stack blogging platform designed to enable users to create, share, and explore diverse content across various categories. It aims to foster a vibrant community of writers and readers by providing an intuitive interface for creating and managing blog posts, while ensuring robust user authentication, data security, and seamless integration with modern web technologies.

## Features

- User Authentication: Secure user registration and login mechanisms using JWT tokens.
- Content Creation: Rich text editor for creating blog posts with support for media uploads and formatting options.
- Category Management: Organized categorization of blog posts, allowing users to easily navigate and discover content.
- Responsive Design: Mobile-friendly layout that ensures optimal user experience across various devices.
- Database Integration: Efficient storage and retrieval of user data and blog posts using a relational database.

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript, Bootstrap
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT (JSON Web Tokens)
- File Uploads: Multer
- Other Tools Bcrypt (for password hashing), dotenv (for environment variable management), CORS (for cross-origin resource sharing)

## Setup Instructions

### Prerequisites

- Node.js and npm (Node Package Manager) installed on your machine.
- MySQL database server installed and running.

### Installation

1. Clone the repository:
   git clone https://github.com/yourusername/blogwave.git
2. Navigate to the project directory:
   cd blogwave
3. Install the dependencies:
   npm install
4. Set up the environment variables:
   DB_HOST=localhost
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  DB_NAME=blog_platform
  JWT_SECRET=your_jwt_secret
5. Initialize the database:
   mysql -u your_db_user -p your_db_password blog_platform < database/blog_platform.sql
6. Start the server:
   npm start

### Running the Application:
  Open your web browser and navigate to http://localhost:3000 to see the application in action.
### Contributing:
  Contributions are welcome! Please read the Contributing Guidelines for details on our code of conduct and the process for submitting pull requests.
