# Get Started in 5 Minutes

## Step 1: Create MongoDB Account (2 min)

Go to: https://www.mongodb.com/cloud/atlas

1. Click "Try Free"
2. Sign up with email
3. Create cluster
   - Choose "AWS"
   - Choose nearest region
   - Click "Create"
   - Wait 2 minutes...

## Step 2: Get Connection String (1 min)

1. Once cluster is created, click "Connect"
2. Choose "Drivers"
3. Choose "Node.js"
4. Copy the connection string
5. Replace `<password>` with your MongoDB password
6. Replace `myFirstDatabase` with `speak2campus`

Example:
\`\`\`
mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/speak2campus?retryWrites=true&w=majority
\`\`\`

## Step 3: Add Environment Variable (1 min)

### For Local Development

Create file `.env.local` in your project root:

\`\`\`env
MONGODB_URI=mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/speak2campus?retryWrites=true&w=majority
MONGODB_DB=speak2campus
\`\`\`

Save and close.

### For Vercel Deployment (skip if local only)

1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add `MONGODB_URI` with your connection string
5. Add `MONGODB_DB` = `speak2campus`

## Step 4: Run Project (1 min)

\`\`\`bash
npm install
npm run dev
\`\`\`

Open: http://localhost:3000

## Step 5: Add Test Data (1 min)

1. On homepage, click "Admin" button (bottom right)
2. Login:
   - Username: `admin`
   - Password: `admin`
3. Click "Add Faculty Member"
4. Fill in form:
   - Name: Dr. John Smith
   - Designation: Associate Professor
   - Specialization: Computer Science
   - Email: john@example.com
   - Cabin: Room 101
5. Click "Add Faculty"
6. Success! ✓

## Step 6: Test It Works (1 min)

1. Click "Home" button
2. Say or type: "Tell me about the faculty"
3. It should tell you about Dr. John Smith!
4. Your data is in MongoDB!

## You're Done!

That's it! Your project is running with MongoDB.

---

## Troubleshooting

**Error: "MONGODB_URI is not set"**
- Did you create `.env.local` file?
- Did you paste the connection string?
- Did you restart dev server? (Ctrl+C then npm run dev)

**Error: "connection timeout"**
- Check MongoDB Atlas dashboard
- Make sure cluster is running (not paused)
- Check your internet connection
- Verify password in connection string

**Data not saving?**
- Check browser console for errors (F12)
- Check that you filled all required fields
- Try refreshing the page

**"Cannot read property 'ObjectId'"**
- This means MongoDB driver isn't installed
- Run: `npm install`

---

## Next Steps

Once working locally:

1. **Deploy to Vercel** (optional)
   - Push code to GitHub
   - Connect to Vercel
   - Add same environment variables
   - Done!

2. **Add Real Data**
   - Keep adding faculty, locations, events, timetable

3. **Customize for Your College**
   - Edit admin page styling
   - Add college logo
   - Change colors

---

## Files You Should Know

- **`.env.local`** ← Create this with your MongoDB URI
- **`MONGODB_COMPLETE_SETUP.md`** ← Read for full guide
- **`FIXED_AND_READY.md`** ← What was changed
- **`app/api/faculty/route.ts`** ← Example API code
- **`lib/supabase/server.ts`** ← MongoDB connection code

---

## Verify It's Working

Open browser console (F12) and look for:
\`\`\`
[v0] MongoDB connected successfully
\`\`\`

If you see this, you're good to go!

---

## I'm Stuck

1. Check if MONGODB_URI is set: `echo $MONGODB_URI`
2. Check MongoDB Atlas dashboard
3. Read `MONGODB_COMPLETE_SETUP.md`
4. Check that dev server is running
5. Restart everything and try again

---

## Quick Commands

\`\`\`bash
# Install dependencies
npm install

# Run locally
npm run dev

# Stop server
Ctrl+C

# Check environment variables
echo $MONGODB_URI
echo $MONGODB_DB

# Build for production
npm run build
\`\`\`

---

**That's it! You now have a fully working MongoDB project.** 🎉

Start at Step 1 above!
