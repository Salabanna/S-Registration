# Deploy to Render - Step by Step Guide

## Prerequisites
1. Create a Render account at https://render.com
2. Push your code to GitHub (if not already done)

## Deployment Steps

### 1. Connect GitHub Repository
- Go to Render Dashboard
- Click "New +" → "Web Service"
- Connect your GitHub account
- Select this repository

### 2. Configure Service Settings
- **Name**: studentportal (or your preferred name)
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or upgrade as needed)

### 3. Set Environment Variables
In Render dashboard, add these environment variables:

**Required Variables:**
- `MONGODB_URI` = `mongodb+srv://Salabanna:2VVcdSSdkEZgmidK@cluster0.06ubzmu.mongodb.net/?appName=Cluster0`
- `JWT_SECRET` = `your_jwt_secret_key` (change this to a secure random string)
- `NODE_ENV` = `production`

**Optional Variables:**
- `PORT` = `10000` (Render will set this automatically)

### 4. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy your app
- Wait for deployment to complete (usually 2-5 minutes)

### 5. Access Your App
- Once deployed, you'll get a URL like: `https://studentportal-xxxx.onrender.com`
- Your app will be live at this URL

## Important Notes

### Security Recommendations:
1. **Change JWT_SECRET**: Use a strong, random secret key
2. **Database Security**: Consider creating a new MongoDB user with limited permissions
3. **Environment Variables**: Never commit sensitive data to GitHub

### Free Tier Limitations:
- App sleeps after 15 minutes of inactivity
- 750 hours/month limit
- Cold starts may take 30+ seconds

### Troubleshooting:
- Check Render logs if deployment fails
- Ensure all dependencies are in package.json
- Verify MongoDB connection string is correct

## Post-Deployment
1. Test all functionality (login, register, courses)
2. Monitor logs for any errors
3. Consider upgrading to paid plan for production use

Your Student Portal is now live on Render! 🚀