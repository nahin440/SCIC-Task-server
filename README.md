# TaskMan

## Overview
The backend of TaskNest is a Node.js and Express-based server that manages task operations, real-time updates with Socket.io, and data storage using MongoDB. The server is deployed on Vercel for production.

## **Live Demo**
🔗 [Server Live Link](https://scic-task-server.onrender.com)

## Features
- Task CRUD operations (Create, Read, Update, Delete)
- WebSocket integration for real-time task updates
- User authentication using Firebase Authentication
- Task ordering and prioritization with drag-and-drop
- Secure API with environment variable configurations

## Tech Stack
- **Node.js** - Backend runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **Firebase Authentication** - User authentication
- **Cors & Dotenv** - Middleware for security and environment configurations

## Installation
### Prerequisites
Make sure you have the following installed:
- Node.js (latest version recommended)
- MongoDB Atlas (or local MongoDB instance)
- Firebase Project with Authentication enabled

### Clone the repository
```sh
git clone https://github.com/yourusername/tasknest-backend.git
cd tasknest-backend
```

### Install dependencies
```sh
npm install
```

### Setup Environment Variables
Create a `.env` file in the root directory and add the following variables:
```sh
PORT=5000
DB_USER=your_mongo_username
DB_PASS=your_mongo_password
JWT_SECRET=your_jwt_secret
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Run the server
```sh
npm start
```
The server should be running on `http://localhost:5000`

## API Endpoints
### User Authentication
- `POST /users` - Register or update user
- `GET /users/:email` - Get user data by email

### Task Management
- `POST /tasks` - Create a new task
- `GET /tasks?email=user@example.com` - Fetch tasks for a user
- `PUT /tasks/:id` - Update a task
- `PUT /tasks/reorder` - Reorder tasks after drag and drop
- `DELETE /tasks/:id` - Delete a task

### WebSocket Events
- `taskCreated` - Task is created and broadcasted
- `taskUpdated` - Task is updated in real-time
- `taskDeleted` - Task is removed and broadcasted
- `tasksReordered` - Tasks are reordered

## Deployment
### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and follow setup prompts
3. Deploy: `vercel --prod`

## Dependencies
```json
{
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "mongodb": "^6.13.0",
  "socket.io": "^4.8.1"
}
```

## License
This project is open-source and available under the MIT License.
