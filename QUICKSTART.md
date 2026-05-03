# Quick Start Guide - Manager Deposit Management

## What Was Created

I've generated a complete manager deposit management interface for you. Here's what's included:

### Frontend Components Created:

1. **ManagerNavbar.jsx** - Reusable navigation bar with 6 menu items
2. **DepositsManagement.jsx** - Main deposit management page with:
   - Two tabs: "Kiểm tra khách" and "Biên bản"
   - Search filters by customer name, date, reference number
   - Approve/Reject buttons
   - Real-time status updates
3. **Placeholder Pages**:
   - BienBan.jsx
   - RoomChecking.jsx
   - Reconciliation.jsx
   - Management.jsx

### Services Created:

4. **depositService.js** - API service for backend communication with methods:
   - getPaidDeposits()
   - getApprovedDeposits()
   - approveDeposit(maPhieu)
   - rejectDeposit(maPhieu)

### Configuration Files:

5. **App.jsx** - Updated with routing for all pages
6. **vite.config.js** - Vite configuration for React development
7. **index.css** - Tailwind CSS setup with custom styles
8. **package.json** - Updated with all necessary dependencies

---

## How to Run

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- React & React DOM
- React Router for navigation
- Axios for API calls
- Vite as build tool
- Tailwind CSS for styling

### Step 2: Ensure Backend is Running

Make sure your backend server is running on `http://localhost:3000`

```bash
cd backend
npm install
npm start
# or node src/server.js
```

### Step 3: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:5173`

---

## Page Flow

```
/manager/deposits (Default)
├── Tab 1: Kiểm tra khách (Pending Deposits)
│   ├── Display paid deposits
│   ├── Search functionality
│   └── Approve/Reject buttons
│
└── Tab 2: Biên bản (Approved Deposits)
    ├── Display approved deposits
    └── Read-only view
```

---

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/hopdong/deposits-paid` | Fetch paid deposits |
| GET | `/api/hopdong/deposits-approved` | Fetch approved deposits |
| POST | `/api/hopdong/deposit/:maPhieu/approve` | Approve deposit |
| POST | `/api/hopdong/deposit/:maPhieu/reject` | Reject deposit |

---

## Key Features

✅ **Responsive Design** - Works on desktop and tablet  
✅ **Real-time Updates** - Data refreshes after actions  
✅ **Search & Filter** - Find deposits quickly  
✅ **Error Handling** - User-friendly error messages  
✅ **Success Feedback** - Confirmation messages for actions  
✅ **Reusable Navbar** - Same navigation across all pages  

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ManagerNavbar.jsx
│   ├── pages/
│   │   └── manager/
│   │       ├── DepositsManagement.jsx
│   │       ├── BienBan.jsx
│   │       ├── RoomChecking.jsx
│   │       ├── Reconciliation.jsx
│   │       └── Management.jsx
│   ├── services/
│   │   └── depositService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── package.json
└── tailwind.config.js (auto-generated)
```

---

## Customization Tips

### Change API URL
Edit `frontend/src/services/depositService.js`:
```javascript
const API_BASE_URL = 'http://your-server:port/api/hopdong';
```

### Change Colors
Update Tailwind classes in components (e.g., `bg-green-700` → `bg-blue-700`)

### Add More Navigation Items
Edit `ManagerNavbar.jsx` and add to the `navItems` array

### Add New Pages
1. Create page file in `frontend/src/pages/manager/`
2. Import in `App.jsx`
3. Add route to `<Routes>`
4. Add link to `ManagerNavbar.jsx`

---

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### CORS errors
Check backend `app.js` has:
```javascript
const cors = require('cors');
app.use(cors());
```

### Port already in use
```bash
# Change port in vite.config.js
npm run dev -- --port 3001
```

### Data not loading
1. Check backend is running
2. Verify API endpoints are correct
3. Check browser DevTools Network tab
4. Ensure database has data

---

## Next Steps

Once this is working, you can:
- Add more functionality to placeholder pages
- Implement the "Biên bản" tab features
- Add customer management
- Add room management
- Add reporting features

All pages will automatically get the same navbar with consistent styling!
