# Realtime Notifications Exam

## Project Structure

- **Backend:** Node.js + Express + Socket.IO + Redis Pub/Sub  
  Port: `3001`  
  File: `backend/src/index.js`

- **Frontend:** React + Vite  
  Port: `5173`  
  Files: `frontend/src/App.jsx`, `frontend/src/main.jsx`

- **Redis:** Docker, default port `6379`

---

## Setup

### 1. Start Redis
```bash
docker run --rm -p 6379:6379 redis:7
```

### 2. Start Backend 
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frotend
```bash
cd frontend
npm install
npm run dev
```

## Testing

### Backend Health Check:
Open http://localhost:3001/health
→ should return {"ok":true}

### Send Notification (PowerShell):

```
Invoke-RestMethod -Uri http://localhost:3001/notify -Method POST -ContentType "application/json" -Body '{"type":"success","message":"Test Notification"}'
```

### Frontend:
Open http://localhost:5173
→ live feed shows backlog and new notifications immediately
=======
# realTimeNotificationsServer
>>>>>>> fb160c1e4e4042a78d2ca71bbb19327af257fecf
