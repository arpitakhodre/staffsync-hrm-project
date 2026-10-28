# StaffSync - Modern Human Resource Management Solution

A MERN-stack web app that digitises core HR work for three roles: **HR**, **Manager** and **Employee**.

## Features
- JWT login with role-based access (HR, Manager, Employee)
- HR: add, edit and remove employees, post announcements, review all leave, see all attendance
- Manager: review leave and see attendance for their own team, create and assign training programs
- Employee: apply for leave, check in and out, read announcements, finish assigned training
- Dashboard with numbers that change by role

## Tech stack
MongoDB, Express.js, React (Vite), Node.js, Bootstrap, JWT, bcrypt

## Run it locally
Requirements: Node.js 16+, MongoDB running locally (or a MongoDB Atlas connection string).

```bash
# 1. API
cd server
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed                # creates demo accounts
npm run dev                 # http://localhost:5000

# 2. Web app (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo accounts (password `Pass@123`): `hr@staffsync.com`, `manager@staffsync.com`, `employee@staffsync.com`

## API overview
| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Employees (HR/Manager) | `GET/POST /api/employees`, `PUT/DELETE /api/employees/:id` |
| Leave | `POST /api/leaves`, `GET /api/leaves/mine`, `GET /api/leaves/review`, `PATCH /api/leaves/:id/status` |
| Attendance | `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/mine`, `GET /api/attendance/team` |
| Announcements | `GET/POST /api/announcements`, `DELETE /api/announcements/:id` |
| Training | `GET/POST /api/training`, `PATCH /api/training/:id/complete`, `DELETE /api/training/:id` |
| Dashboard | `GET /api/dashboard` |

## Deploying (for the demo link)
1. Database: create a free MongoDB Atlas cluster and copy its connection string.
2. API: deploy `server/` on Render (start command `npm start`). Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
3. Web app: deploy `client/` on Vercel or Netlify (build command `npm run build`, output `dist`). Set `VITE_API_URL` to `https://<your-api>/api`.
4. Run `npm run seed` once with the Atlas `MONGO_URI` so the demo accounts exist.
