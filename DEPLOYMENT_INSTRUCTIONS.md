# 🚀 Firebase Configuration Deployment Guide

## Critical: Follow These Steps in Order

### Step 1: Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

**What this does:** Updates Firestore permissions so users can only access their own invoices.

---

### Step 2: Deploy Storage Security Rules
```bash
firebase deploy --only storage
```

**What this does:** Updates Storage permissions so users can only upload to their own folder.

---

### Step 3: Apply CORS Configuration
```bash
gsutil cors set cors.json gs://gfgproject-8745b.firebasestorage.app
```

**What this does:** Allows your localhost:5173 app to upload files to Firebase Storage.

**Don't have gsutil?** Install it:
- Windows: Download [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Mac: `brew install google-cloud-sdk`
- Linux: `curl https://sdk.cloud.google.com | bash`

**Alternative (if gsutil fails):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/storage/browser)
2. Find bucket: `gfgproject-8745b.firebasestorage.app`
3. Click "Permissions" → "CORS" → Upload `cors.json`

---

### Step 4: Verify CORS Applied Successfully
```bash
gsutil cors get gs://gfgproject-8745b.firebasestorage.app
```

You should see your CORS configuration in the output.

---

### Step 5: Test the Application
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Reload** your app at http://localhost:5173
3. **Try uploading an invoice**
4. **Check browser console** for any remaining errors

---

## 🔍 Troubleshooting

### "Missing or insufficient permissions" error
- ✅ Deployed firestore.rules? Run Step 1 again
- ✅ User logged in? Check `auth.currentUser` in console
- ✅ Document has `ownerId` field? Check Firestore console

### "Blocked by CORS policy" error
- ✅ Applied CORS config? Run Step 3 again
- ✅ Wait 2-3 minutes after applying CORS
- ✅ Clear browser cache completely

### "storage/unauthorized" error
- ✅ Deployed storage.rules? Run Step 2 again
- ✅ File path correct? Should be `/invoices/{userId}/...`
- ✅ User authenticated? Check login status

---

## ✅ Success Indicators

After deployment, you should see:
- ✅ No "permission-denied" errors in console
- ✅ No "CORS policy" errors in console  
- ✅ "Add Invoice" button resets properly after upload
- ✅ Invoices appear in the dashboard table

---

## 📝 What Changed in the Code

### InvoicesModule.tsx
- ✅ Auth guard before upload
- ✅ Comprehensive error detection (storage/unauthorized, permission-denied, CORS)
- ✅ Guaranteed UI cleanup in `finally` block
- ✅ User-friendly error messages

### invoices.tsx (Hook)
- ✅ Auth guard before Firestore query
- ✅ Enhanced permission error detection
- ✅ Graceful fallback to dummy data

### Security Rules
- ✅ Firestore: Users can only access invoices where `ownerId` matches their `uid`
- ✅ Storage: Users can only access `/invoices/{userId}/` where `{userId}` matches their `uid`

---

## 🆘 Still Having Issues?

1. Check Firebase Console → Authentication (user logged in?)
2. Check Firestore Console → invoices collection (documents have `ownerId`?)
3. Check browser DevTools → Network tab (see actual error responses)
4. Run: `firebase deploy --only firestore:rules,storage` (deploy both at once)
