# Manager Deposit Management System

This is a React-based manager interface for managing customer deposits, built with Vite, React Router, Tailwind CSS, and Axios.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ManagerNavbar.jsx          # Reusable navigation bar
│   ├── pages/
│   │   └── manager/
│   │       ├── DepositsManagement.jsx # Main deposits management page
│   │       ├── BienBan.jsx           # Placeholder pages
│   │       ├── RoomChecking.jsx
│   │       ├── Reconciliation.jsx
│   │       └── Management.jsx
│   ├── services/
│   │   └── depositService.js         # API service for deposit operations
│   ├── App.jsx                        # Main app routing
│   └── main.jsx
└── package.json
```

## Features

- **Deposit Management**: View and manage customer deposits
- **Approve/Reject Deposits**: Accept or reject deposit applications
- **Search Functionality**: Filter deposits by customer name, date, or reference number
- **Responsive Design**: Built with Tailwind CSS for responsive layouts
- **API Integration**: Full integration with backend deposit endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Backend URL

Edit `src/services/depositService.js` and update the API_BASE_URL if needed:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/hopdong';
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port)

### 4. Backend Requirements

Ensure your backend server is running on `http://localhost:3000` and has the following endpoints:

- `GET /api/hopdong/deposits-paid` - Get all paid deposits
- `GET /api/hopdong/deposits-approved` - Get all approved deposits
- `POST /api/hopdong/deposit/:maPhieu/approve` - Approve a deposit
- `POST /api/hopdong/deposit/:maPhieu/reject` - Reject a deposit

## API Service Methods

The `depositService.js` provides the following methods:

### getPaidDeposits()
Fetches all paid deposits that don't have a contract yet.

**Returns:** Array of deposit objects

### getApprovedDeposits()
Fetches all approved deposits.

**Returns:** Array of deposit objects

### approveDeposit(maPhieu)
Approves a specific deposit by its ID.

**Parameters:**
- `maPhieu` (string): The deposit reference number

### rejectDeposit(maPhieu)
Rejects a specific deposit.

**Parameters:**
- `maPhieu` (string): The deposit reference number

## Component Structure

### ManagerNavbar
Reusable navigation bar that appears on all manager pages. Includes links to:
- Kiểm tra khách (Customer Verification)
- Biên bản (Minutes)
- Kiểm tra phòng (Room Checking)
- Phiếu đối soát (Reconciliation)
- Quản lý (Management)
- Đăng xuất (Logout)

### DepositsManagement
Main page for managing deposits with two tabs:

**Tab 1: Kiểm tra khách (Customer Verification)**
- Displays paid deposits
- Search filters for reference number, customer name, date, and notes
- Approve/Reject buttons for each deposit
- Real-time status updates

**Tab 2: Biên bản (Minutes)**
- Displays approved deposits
- Read-only view with deposit details
- Option to create documents

## Data Model

Deposits are expected to have the following properties:

```javascript
{
    MaPhieu: string,           // Deposit reference number
    TenKhach: string,          // Customer name
    HoTenKhach: string,        // Alternative customer name field
    NgayThue: string,          // Rental date
    GhiChu: string,            // Notes
    TenPhong: string,          // Room name (for minutes tab)
    // Additional fields based on your database
}
```

## Styling

The project uses Tailwind CSS for styling. Key classes used:
- `bg-green-700` - Primary green color for buttons and active states
- `bg-gray-100` - Light gray backgrounds
- `hover:bg-green-800` - Hover states
- `border-green-700` - Border colors

## Error Handling

The component includes error handling with user-friendly messages:
- Network errors are displayed to the user
- Success messages appear after successful operations
- Loading states show while data is being fetched

## Extending the Application

### Adding New Tabs

1. Create a new page in `src/pages/manager/`
2. Import it in `App.jsx`
3. Add the route
4. Update `ManagerNavbar.jsx` if needed

### Adding New API Methods

1. Add methods to `src/services/depositService.js`
2. Use them in your components with try-catch error handling

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your backend has CORS enabled. Update your backend `app.js`:

```javascript
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
```

### API Connection Issues
- Check that backend is running on `http://localhost:3000`
- Verify the API endpoints are correct in `depositService.js`
- Check browser console for detailed error messages

### Data Not Loading
- Verify backend database has data in the deposit tables
- Check that the stored procedures are implemented correctly
- Look at the Network tab in browser DevTools to see API responses
