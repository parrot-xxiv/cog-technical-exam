# To-Do List App – Technical Exam

This is a full-stack To-Do List application built with **Node.js**, **Express**, **React**, and **SQLite**, featuring JWT-based user authentication. The app includes both a RESTful API backend and a React frontend for managing to-do items.

---

## Live Demo

- **Frontend (Vercel)**: [View Frontend](https://cog-technical-exam-client.vercel.app/)  
- **Backend (Render)**: [View API](https://cog-technical-exam-server.onrender.com)

> Note: To access `/todos` endpoints, users must be authenticated.

---

## Tech Stack

### Frontend
- React (with Vite)
- React Context for state management
- Native fetch API for HTTP requests
- Vercel (Deployment)

### Backend
- Node.js
- Express.js
- SQLite (Data persistence)
- JWT (Authentication)
- Render (Deployment)

---

## API Endpoints

### Auth Routes

- `POST /auth/register` – Register a new user  
- `POST /auth/login` – Log in and receive JWT

### Todo Routes (Protected)

> Requires Bearer Token in `Authorization` header

- `GET /todos` – Fetch all todos  
- `POST /todos` – Add a new todo  
- `PUT /todos/:id` – Update a todo  
- `DELETE /todos/:id` – Delete a todo  

---

## Testing

- All endpoints tested using **Postman** and **Thunder Client**
- Proper validation and error handling implemented (e.g., invalid ID, missing fields)

---

## Sample API Requests

### Protected Route (With JWT Auth)

#### Fetch Todos (Authorized)

```http
GET /todos HTTP/1.1
Host: https://cog-technical-exam-server.onrender.com 
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Add New Todo (Authorized)

```http
POST /todos HTTP/1.1
Host: https://cog-technical-exam-server.onrender.com
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Finish project report",
  "completed": false
}
```

### Unauthorized Request (No Token)

```http
GET /todos HTTP/1.1
Host: https://cog-technical-exam-server.onrender.com
Content-Type: application/json
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

---

## Auth Endpoints

### Register

```http
POST /auth/register HTTP/1.1
Host: https://cog-technical-exam-server.onrender.com
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword"
}
```

### Login

```http
POST /auth/login HTTP/1.1
Host: https://cog-technical-exam-server.onrender.com
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyFOefma..."
}
```

---

## Features

### Backend
- RESTful API using Express
- JWT-based authentication
- SQLite for lightweight, persistent storage
- Comprehensive error handling (invalid IDs, missing fields, etc.)

### Frontend
- Clean and responsive UI
- Vite-powered React setup
- React Context for global state management
- Native fetch for API interaction
- Display, add, update, and delete todos
- Mark todos as complete
- Route protection based on authentication state

---

## Bonus Implementations

- JWT authentication on both frontend and backend
- SQLite database (instead of in-memory)
- Deployed backend (Render) and frontend (Vercel)

---

## Project Structure

```
/client     - React frontend  
/server     - Node.js + Express backend  
```