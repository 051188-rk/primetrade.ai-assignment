# Task Management System

A full-stack task management application with user authentication, role-based access control, and comprehensive task management features.

## 🌟 Features

### 🔐 Authentication & Authorization
- User registration and login with JWT
- Protected routes and API endpoints
- Password hashing with bcrypt
- Role-based access control (User/Admin)

### 📝 Task Management
- Create, read, update, and delete tasks
- Assign tasks to team members
- Filter and search functionality
- Task status tracking
- Due date management

### 👥 User Management
- User profile management
- Secure password updates
- Admin dashboard for user management
- Role-based permissions

## 🚀 Live Demos

- **Frontend**: [https://primetrade-ai-assignment-five.vercel.app/](https://primetrade-ai-assignment-five.vercel.app/)
- **Backend API**: [https://primetrade-ai-assignment.onrender.com/](https://primetrade-ai-assignment.onrender.com/)
- **API Documentation**: [Postman Documentation](https://documenter.getpostman.com/view/48053509/2sB3QGuX1D)

> **Note**: The backend is hosted on Render's free tier and may take a moment to wake up if inactive. Please be patient when making the first request.

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API requests
- TailwindCSS for styling
- React Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Express Validator for input validation
- CORS for cross-origin requests
- Swagger for API documentation

## Database
<div align="center">
  <img src="https://raw.githubusercontent.com/051188-rk/primetrade.ai-assignment/main/frontend/public/schema.png" alt="schema diagram" width="1000"/>
</div>

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/051188-rk/primetrade.ai-assignment.git
   cd primetrade.ai-assignment/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd primetrade.ai-assignment/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
primetrade.ai-assignment/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
│
└── frontend/
    ├── public/          # Static files
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # React context
        ├── pages/       # Page components
        ├── utils/       # Utility functions
        ├── App.js       # Main App component
        └── index.js     # Entry point
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password

For complete API documentation, please refer to the [Postman Documentation](https://documenter.getpostman.com/view/48053509/2sB3QGuX1D).

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment-based configuration

