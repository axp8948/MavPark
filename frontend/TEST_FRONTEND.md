# Frontend Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check if the server is running
```bash
cd /Users/piyushsingh/Desktop/MavPark/frontend
npm run dev
```

The terminal should show:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 2. Open your browser and check for errors

1. Open: http://localhost:5173/
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Look for any red error messages

### 3. Common Issues and Solutions

#### Issue: "Module not found: @stomp/stompjs"
**Solution:**
```bash
cd frontend
npm install
```

#### Issue: "Cannot read properties of undefined"
**Check:** Browser console for the exact line number

#### Issue: Blank page
**Check:** 
1. Browser console for errors
2. Network tab for failed requests
3. Make sure you're on http://localhost:5173/

#### Issue: "WebSocket connection failed"
**This is NORMAL if Spring backend is not running!**
- You should see: 🔴 "Connecting..." or "Connection Error"
- This won't break the page, it just means WebSocket isn't connected yet
- The page should still display with mock data

### 4. Check what URL you're at

- **http://localhost:5173/** → Should show Home page (ParkingLots)
- **http://localhost:5173/dashboard** → Should show Dashboard
- If you see a blank page, check the URL

### 5. Test each page separately

#### Test Home/ParkingLots Page:
```
URL: http://localhost:5173/
Expected: Should see "MavPark" logo and "Available Parking Lots"
```

#### Test Dashboard Page:
```
URL: http://localhost:5173/dashboard
Expected: Should see blue header with MavPark logo and title
```

### 6. Check if files exist

Run these commands:
```bash
cd /Users/piyushsingh/Desktop/MavPark/frontend
ls -la src/hooks/useWebSocket.js
ls -la src/services/websocketService.js
ls -la src/conf/config.js
```

All should exist.

### 7. Verify imports are correct

Check these files don't have syntax errors:
```bash
cat src/hooks/useWebSocket.js | head -20
cat src/services/websocketService.js | head -20
cat src/pages/ParkingLots.jsx | head -20
```

## What Error Are You Seeing?

Please tell me EXACTLY what you see:

### Option A: Blank White Page
- [ ] The page is completely blank/white
- [ ] Console shows error: _________________

### Option B: Page Shows But Error in Console
- [ ] Page displays but console has red errors
- [ ] Error message: _________________

### Option C: Cannot Start Server
- [ ] `npm run dev` fails
- [ ] Error message: _________________

### Option D: WebSocket Connection Error
- [ ] Page works but shows "Connection Error"
- [ ] This is NORMAL if Spring backend isn't running!

### Option E: Import Error
- [ ] Error about missing module
- [ ] Module name: _________________

## Quick Fix Commands

### Reset Everything
```bash
cd /Users/piyushsingh/Desktop/MavPark/frontend

# Stop any running servers
# Press Ctrl+C if dev server is running

# Clean install
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

### Just Reinstall WebSocket Packages
```bash
cd /Users/piyushsingh/Desktop/MavPark/frontend
npm install @stomp/stompjs sockjs-client
npm run dev
```

## Expected Behavior

### When Spring Backend is NOT running:
✅ Page should load fine
✅ Shows parking lots with mock data
🔴 Top-right shows "Connecting..." or "Connection Error"
✅ Everything else works normally

### When Spring Backend IS running:
✅ Page should load fine
✅ Shows parking lots with real data
🟢 Top-right shows "Live Updates"
✅ Real-time updates work

## Still Not Working?

**Tell me:**
1. What URL are you visiting?
2. What do you see on the page (blank, error, or something)?
3. What's in the browser console (F12)?
4. What does `npm run dev` output show?

