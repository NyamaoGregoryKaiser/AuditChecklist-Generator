# Deployment Guide

This guide will help you deploy your Audit Checklist application to Railway (backend + PostgreSQL) and Vercel (frontend).

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Railway account (https://railway.app)
3. Vercel account (https://vercel.com)
4. OpenAI API key (for AI features)

## Backend Deployment (Railway)

### Step 1: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `backend`
5. Railway will automatically detect it's a Python project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically add the `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

```
SECRET_KEY=your-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app
OPENAI_API_KEY=your-openai-api-key
```

### Step 4: Deploy and Run Migrations

1. Railway will automatically deploy your app
2. Once deployed, go to the "Deployments" tab
3. Click on the latest deployment and open the logs
4. Run these commands in the Railway shell:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Step 5: Get Your Railway Domain

1. Go to your Railway project settings
2. Copy the generated domain (e.g., `https://your-app-name.railway.app`)

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Set the root directory to `frontend`
5. Vercel will automatically detect it's a React app

### Step 2: Configure Environment Variables

In your Vercel project settings, add:

```
REACT_APP_API_URL=https://your-railway-domain.railway.app/api
```

### Step 3: Update CORS Settings

1. Go back to your Railway project
2. Add this environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

### Step 4: Deploy

Vercel will automatically deploy your frontend. The build should complete successfully.

## Local Development Setup

### Backend (with PostgreSQL)

1. Install PostgreSQL locally
2. Create a `.env` file in the `backend` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/audit_checklist
OPENAI_API_KEY=your-openai-api-key
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. Start the server:
```bash
python manage.py runserver
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

3. Start the development server:
```bash
npm start
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Railway domain is added to `CORS_ALLOWED_ORIGINS`
2. **Database Connection**: Verify the `DATABASE_URL` is correctly set in Railway
3. **Build Failures**: Check that all dependencies are in `requirements.txt`
4. **Environment Variables**: Ensure all required env vars are set in both Railway and Vercel

### Railway Commands

- View logs: Railway dashboard → Deployments → Latest deployment → Logs
- Run commands: Railway dashboard → Deployments → Latest deployment → Shell
- Restart app: Railway dashboard → Settings → Restart

### Vercel Commands

- View logs: Vercel dashboard → Deployments → Latest deployment → Functions
- Redeploy: Vercel dashboard → Deployments → Latest deployment → Redeploy

## Security Notes

1. Never commit `.env` files to your repository
2. Use strong, unique secret keys in production
3. Keep your OpenAI API key secure
4. Regularly update dependencies
5. Monitor your Railway and Vercel usage

## Cost Optimization

- Railway: Free tier includes 500 hours/month
- Vercel: Free tier includes unlimited deployments
- Monitor usage in both platforms to avoid unexpected charges 