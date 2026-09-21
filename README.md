# Aerocon Star Gazing Backend

Backend API for the Aerocon **Star Gazing** event registration system built using Node.js, Express, Mongoose, and MongoDB Atlas.

---

## Features

- **9 Time Slots (10-minute intervals)**: Pre-seeded automatically from 6:30 PM to 8:00 PM.
- **Strict Capacity Control (Max 8 per slot)**: Atomic database updates prevent race conditions and overbooking.
- **Student Data Validation**: Validates `name`, `email`, `roll`, and `batch` (`k24`, `k25`, `k26`).
- **One Registration Per Student**: Enforces unique roll and email across the entire event.
- **Entry Passcode Generation**: Generates a unique 7-character alphanumeric passcode (e.g. `K7X9B2`) upon registration.
- **Pass Verification & Check-in**: Verifies pass validity at the event entrance and marks passes as used to prevent reuse.
- **CORS Configured**: Pre-configured for seamless frontend integration (React, Vite, Next.js).

---

## Time Slots (6:30 PM - 8:00 PM)

| Slot # | Time Window | Max Capacity |
| :--- | :--- | :--- |
| 1 | 06:30 PM - 06:40 PM | 8 |
| 2 | 06:40 PM - 06:50 PM | 8 |
| 3 | 06:50 PM - 07:00 PM | 8 |
| 4 | 07:00 PM - 07:10 PM | 8 |
| 5 | 07:10 PM - 07:20 PM | 8 |
| 6 | 07:20 PM - 07:30 PM | 8 |
| 7 | 07:30 PM - 07:40 PM | 8 |
| 8 | 07:40 PM - 07:50 PM | 8 |
| 9 | 07:50 PM - 08:00 PM | 8 |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or edit existing `.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/aerocon?retryWrites=true&w=majority
CLIENT_URL=*
```
> **Note**: Replace `<username>` and `<password>` with your actual MongoDB Atlas database credentials.

### 3. Start the Server
- **Development mode** (with hot reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

---

## API Documentation

### 1. Get All Slots
Fetch all 9 slots with real-time remaining seat counts.

- **Endpoint**: `GET /api/slots`
- **Response**:
```json
{
  "success": true,
  "count": 9,
  "data": [
    {
      "_id": "664fa1...",
      "slotNumber": 1,
      "startTime": "18:30",
      "endTime": "18:40",
      "displayTime": "06:30 PM - 06:40 PM",
      "maxCapacity": 8,
      "bookedCount": 3,
      "remainingSeats": 5,
      "isFull": false
    }
  ]
}
```

---

### 2. Register for a Slot
Register a participant for a specific slot.

- **Endpoint**: `POST /api/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex.k25@college.edu",
  "roll": "25BCS101",
  "batch": "k25",
  "slotId": "664fa1..."
}
```

- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "id": "664fa2...",
    "name": "Alex Johnson",
    "email": "alex.k25@college.edu",
    "roll": "25BCS101",
    "batch": "k25",
    "passCode": "K7X9B2",
    "slot": {
      "slotNumber": 1,
      "displayTime": "06:30 PM - 06:40 PM",
      "startTime": "18:30",
      "endTime": "18:40"
    },
    "registeredAt": "2026-09-22T04:30:00.000Z"
  }
}
```

- **Error Responses**:
  - `400 Bad Request`: Missing fields, invalid batch, or slot is fully booked.
  - `409 Conflict`: Roll number or email has already registered.

---

### 3. Verify Passcode
Check if a passcode is valid and see participant & slot details.

- **Endpoint**: `GET /api/verify-pass/:passCode`
- **Example**: `GET /api/verify-pass/K7X9B2`
- **Response (200 OK)**:
```json
{
  "success": true,
  "valid": true,
  "isUsed": false,
  "checkedInAt": null,
  "data": {
    "name": "Alex Johnson",
    "email": "alex.k25@college.edu",
    "roll": "25BCS101",
    "batch": "k25",
    "passCode": "K7X9B2",
    "slot": {
      "_id": "664fa1...",
      "slotNumber": 1,
      "displayTime": "06:30 PM - 06:40 PM"
    }
  }
}
```

---

### 4. Check-In Participant at Event Gate
Verify the passcode and mark it as checked in so it cannot be reused.

- **Endpoint**: `POST /api/verify-pass`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "passCode": "K7X9B2",
  "checkIn": true
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "valid": true,
  "isUsed": true,
  "checkedInAt": "2026-09-22T18:32:00.000Z",
  "checkInMessage": "Checked in successfully!",
  "data": { ... }
}
```
*(If already checked in, it returns `checkInMessage: "Warning: Pass has already been used..."`)*

---

### 5. Get All Registrations (Admin)
- **Endpoint**: `GET /api/registrations`
- **Response**: List of all registered students with their slot details.

---

## QR Code Frontend Integration

On your frontend (React / Vite), you can easily generate a QR code for the `passCode`:

```jsx
import QRCode from 'react-qr-code'; // or 'qrcode.react'

// Inside your Registration Success component:
<QRCode value={registration.passCode} size={180} />
<p>Passcode: {registration.passCode}</p>
```
At the entrance, an organizer can scan the QR code with their camera/scanner which reads the `passCode` and calls `POST /api/verify-pass` with `{ "passCode": scannedCode, "checkIn": true }`.

