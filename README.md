# TaskFlow - Modern Workplace Task Management Platform

TaskFlow is a full-stack MERN application designed for professional workplace task management with dual roles: **EMPLOYER** and **EMPLOYEE**.

---

## Quick Start Commands

### 1. Prerequisites
- **Node.js**: v18+ (verified with v22)
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017/taskflow`

---

### 2. Running the Application

You can run the backend and frontend in two separate terminal tabs:

#### Terminal 1 - Backend Server (Express + MongoDB)
```powershell
cd server
npm run dev
```
> Server runs at: **http://localhost:5000**  
> API Base: **http://localhost:5000/api**  
> Health Check: **http://localhost:5000/api/health**

---

#### Terminal 2 - Frontend Client (React + Vite + Tailwind)
```powershell
cd client
npm run dev
```
> Frontend runs at: **http://localhost:5173**  
> (API calls are automatically proxied from Vite to `http://localhost:5000`)

---

### 3. Alternative: Running from Root Directory

From the project root (`management system/`):
```powershell
# Start Backend
npm run server:dev

# Start Frontend (in another terminal)
npm run client
```

---

## Pre-configured Demo Accounts

You can use the built-in "Quick Demo Accounts" buttons on the `/login` screen or use these credentials:

### Employer Account
- **Email**: `john@example.com`
- **Password**: `password123`
- **Role**: `EMPLOYER`
- **Workspace**: Acme Corp

### Employee Account
- **Email**: `employee@example.com` (or create any employee via `/employer/employees`)
- **Password**: `password123`
- **Role**: `EMPLOYEE`

---

## Implemented Architecture & Status

- **Phase 1: Structure & Dependencies** (Done)
- **Phase 2: Mongoose Models & Schemas** (`User`, `Organization`, `Task`, `Comment`, `Notification`, `TaskActivity`) (Done)
- **Phase 3: JWT Authentication & bcrypt Security** (Done)
- **Phase 4: Role-Based Routing & Shell Layout** (Done)
- **Phase 5 & 6: Task Management, State Workflow & Review System** (Backend Complete)
- **Phase 7 & 8: Dashboards, Comments, Notifications & Timeline** (Backend Complete)
- **Phase 9: Calendar, Analytics & Team Directory** (In Progress)
