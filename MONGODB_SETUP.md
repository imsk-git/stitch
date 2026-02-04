# MongoDB Atlas Setup Guide for Stitch E-Commerce

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Verify your email address

## Step 2: Create a New Cluster
1. After logging in, click "Build a Database"
2. Choose "FREE" shared cluster
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to you
5. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (remember these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

## Step 6: Update .env File
1. Open the .env file in your project
2. Replace the MONGODB_URI with your connection string
3. Replace <username> and <password> with your database user credentials
4. Replace <cluster-url> with your actual cluster URL

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/stitch?retryWrites=true&w=majority
```

## Step 7: Install Dependencies and Run
1. Open terminal in project directory
2. Run: npm install
3. Run: npm run seed (to add sample products)
4. Run: npm start (to start the server)

## Troubleshooting
- Make sure your IP is whitelisted in Network Access
- Verify username/password are correct
- Check that the database name is "stitch" in the connection string
- Ensure all dependencies are installed with npm install