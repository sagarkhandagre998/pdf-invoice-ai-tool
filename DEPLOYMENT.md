# Deployment Guide

## 🚀 Quick Start

1. **Setup Environment**:
   ```bash
   npm run setup
   ```

2. **Configure Environment Variables**:
   - Edit `apps/api/.env` with your MongoDB URI and AI API keys
   - Edit `apps/web/.env.local` with your API URL

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

## 🌐 Vercel Deployment

### Prerequisites
- Vercel account
- MongoDB Atlas cluster
- AI API keys (Gemini/Groq)

### Step 1: Deploy API

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Set Root Directory to `apps/api`
5. Configure Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   FRONTEND_URL=https://your-web-app.vercel.app
   NODE_ENV=production
   ```
6. Deploy

### Step 2: Deploy Web App

1. Create another project in Vercel
2. Set Root Directory to `apps/web`
3. Configure Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app/api
   ```
4. Deploy

### Step 3: Update API Environment

After deploying the web app, update the API's `FRONTEND_URL` environment variable with the actual web app URL.

## 🗄️ MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP addresses (or use 0.0.0.0/0 for Vercel)
5. Get your connection string
6. Update `MONGODB_URI` in your API environment

## 🤖 AI Service Setup

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `GEMINI_API_KEY` environment variable

### Groq
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an API key
3. Add to `GROQ_API_KEY` environment variable

## 🔧 Local Development

### With MongoDB Atlas
```bash
# 1. Setup
npm run setup

# 2. Configure apps/api/.env with your MongoDB Atlas URI
# 3. Configure apps/web/.env.local with http://localhost:3001/api

# 4. Install and start
npm install
npm run dev
```

### With Local MongoDB
```bash
# 1. Install MongoDB locally
# 2. Start MongoDB service
# 3. Update apps/api/.env with mongodb://localhost:27017/pdf-dashboard
# 4. Follow steps above
```

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor API performance and errors

### MongoDB Atlas
- Monitor database performance
- Set up alerts for connection issues

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in API matches your web app URL
   - Check that both apps are deployed and accessible

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has proper permissions

3. **AI Extraction Failing**
   - Verify API keys are correct
   - Check API key quotas and limits
   - Ensure PDF files are valid and under 25MB

4. **Build Failures**
   - Check that all environment variables are set
   - Verify TypeScript compilation
   - Check for missing dependencies

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your API environment.

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's environment variable system
   - Rotate API keys regularly

2. **MongoDB Security**
   - Use strong passwords
   - Enable IP whitelisting
   - Use MongoDB Atlas security features

3. **API Security**
   - Implement rate limiting
   - Add request validation
   - Use HTTPS in production

## 📈 Performance Optimization

1. **Database**
   - Create appropriate indexes
   - Use connection pooling
   - Monitor query performance

2. **API**
   - Implement caching
   - Use compression
   - Optimize PDF processing

3. **Frontend**
   - Enable Next.js optimizations
   - Use image optimization
   - Implement lazy loading
