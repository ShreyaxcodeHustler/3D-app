# 🌌 3D App — Interactive Learning Galaxy

An immersive 3D learning platform that transforms educational content into an explorable galaxy. Topics are represented as planets within a dynamic universe, allowing users to navigate, discover, and interact with learning materials in a visually engaging environment.

Built with **React**, **TypeScript**, **Three.js**, **Node.js**, **Express**, and **MongoDB**, the application combines modern web technologies with gamified learning concepts to create a unique educational experience.

---

## ✨ Features

*  Interactive 3D galaxy visualization using Three.js
*  Topic-based planets containing educational content
*  Secure JWT Authentication (Access & Refresh Tokens)
*  Learning progress tracking
*  Bookmark favorite topics for later review
*  RESTful API for users, topics, planets, and progress
*  Demo data seeding for quick setup
*  Responsive and modern user interface
*  Fast development workflow powered by Vite

---

##  Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Three.js
* React Three Fiber
* React Three Drei
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Zod Validation

### Development Tools

* ESLint
* Nodemon
* Git & GitHub

---

## Project Structure

```text
3d-learning-galaxy/
│
├── client/                 # React + Three.js Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── scripts/
│   └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

---

##  Project Goals

The goal of this project is to make learning more engaging by replacing traditional navigation systems with an interactive 3D exploration experience.

Instead of browsing through menus and pages, users travel through a virtual galaxy where each planet represents a topic, creating a more immersive and memorable learning environment.

---

## 📸 Screenshots

Add screenshots or GIFs here.

### Galaxy View

```text
Insert Screenshot Here
```

### Planet Details Panel

```text
Insert Screenshot Here
```

### User Dashboard

```text
Insert Screenshot Here
```

---

##  Prerequisites

Before running the project, ensure you have:

* Node.js 18+
* npm
* MongoDB Atlas account or local MongoDB installation
* Git

Verify installation:

```bash
node -v
npm -v
```

---

##  Environment Variables

### Backend (`server/.env`)

Create a `.env` file inside the `server` directory:

```env
PORT=5000

FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

COOKIE_SECURE=false
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

##  Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/your-repository-name.git
cd your-repository-name
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

##  Running the Application

Open two terminal windows.

### Start Backend

```bash
cd server
npm run dev
```

Server runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd client
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

##  Seed Demo Data

Populate the database with sample users, planets, and topics.

```bash
cd server
npm run seed
```

Make sure your MongoDB connection is configured correctly before running the seed script.

---

## 🧪 API Overview

All API endpoints are mounted under:

```text
/api
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Topics

```text
GET    /api/topics
GET    /api/topics/:id
POST   /api/topics
PUT    /api/topics/:id
DELETE /api/topics/:id
```

### Progress

```text
GET  /api/progress
POST /api/progress
```

### Bookmarks

```text
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:id
```

---

##  Build for Production

### Build Frontend

```bash
cd client
npm run build
```

### Preview Build

```bash
npm run preview
```

### Start Production Backend

```bash
cd server
npm start
```

---

## Learning Outcomes

This project demonstrates:

* Full-stack application development
* 3D graphics programming using Three.js
* Interactive user experience design
* JWT-based authentication systems
* REST API design and implementation
* MongoDB database modeling
* State management in React
* Modern frontend tooling with Vite

---

##  Future Enhancements

* AI-powered topic recommendations
* Personalized learning paths
* Planet orbit simulations
* Achievement badges and gamification
* Real-time collaborative learning
* Voice-guided navigation
* VR and AR support
* Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

##  Troubleshooting

### MongoDB Connection Issues

* Verify `MONGO_URI`
* Check Atlas IP whitelist
* Ensure MongoDB service is running

### CORS Errors

Ensure:

```env
FRONTEND_URL=http://localhost:5173
```

matches the frontend URL.

### Authentication Problems

Check:

```env
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
COOKIE_SECURE
```

are correctly configured.

---

##  License

This project is licensed under the MIT License.

Feel free to use, modify, and distribute this project for educational and personal purposes.

---

##  Author

Developed as a full-stack 3D educational platform combining immersive visualization with modern web technologies.

⭐ If you found this project useful, consider giving it a star on GitHub!
