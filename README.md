<img width="1536" height="1024" alt="ChatGPT Image Dec 26, 2025, 04_12_31 PM" src="https://github.com/user-attachments/assets/d4519544-a8f3-404a-9407-b59387d902bd" />
# 🔐 Ultimate MERN Authentication System

A **production-ready MERN authentication system** designed with security, scalability, and modern best practices in mind. This project covers everything from secure user registration to advanced protections like **2FA, CSRF, rate-limiting, and role-based access control**, all wrapped in a clean React UI.

---

## 🚀 Features Overview

### 🔑 Authentication & Authorization

* Secure **User Registration & Login**
* **Password Hashing** using `bcrypt`
* **JWT Access & Refresh Tokens** for seamless session management
* **Protected Routes** on both **Frontend & Backend**
* **Role-Based Authorization** (Admin vs User)

### 🛡️ Advanced Security

* **Two-Factor Authentication (2FA / MFA)** using OTPs
* **IP & Email Rate-Limiting** to prevent brute-force attacks
* **CSRF Protection** using `csurf` or custom CSRF tokens
* **NoSQL Injection Prevention** via input sanitization
* **Secure Cookie Management** (`httpOnly`, `secure`, `sameSite`)

### 🎨 Frontend Experience

* Modern, responsive **React UI**
* Clean authentication flows (Login, Register, OTP Verify, Reset Password)
* User-friendly error handling & feedback

---

## 🧱 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS / CSS3

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT (Access & Refresh Tokens)
* Bcrypt
* Redis (optional – rate limiting / token store)

---

## 📁 Project Structure (High Level)

```
root/
├── client/               # React frontend
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
│
├── server/               # Node + Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── utils/
│   └── config/
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User registers → password hashed with bcrypt
2. Login validates credentials → issues **Access Token + Refresh Token**
3. Access Token used for protected APIs
4. Refresh Token rotates session securely
5. Optional **2FA (OTP)** verification step
6. Role-based middleware restricts sensitive routes

---

## 🧪 Security Highlights

* ❌ Prevents NoSQL Injection via sanitization
* ⏱️ Blocks brute-force attacks using rate-limiters
* 🍪 Tokens stored securely in **httpOnly cookies**
* 🔁 Refresh token rotation for session safety
* 🧩 CSRF protection on state-changing requests

---

## 🛠️ Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
COOKIE_SECURE=true
```

---

## ▶️ Getting Started

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 📌 Use Cases

* SaaS Applications
* Admin Dashboards
* E-commerce Platforms
* Secure Internal Tools

---

## 🤝 Contribution

Contributions, issues, and feature requests are welcome!

---

## ⭐ Final Note

This project is built to reflect **real-world authentication standards** used in modern web applications. Perfect for **learning, interviews, or production-ready starters**.

Happy coding! 🚀
