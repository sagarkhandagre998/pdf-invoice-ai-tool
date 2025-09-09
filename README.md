# PDF Viewer + Data Extraction Dashboard

A comprehensive PDF invoice management system that allows users to upload PDFs, extract data using AI (Gemini or Groq), and manage invoice records with full CRUD operations.

## 🚀 Features

- **PDF Upload & Viewing**: Upload PDFs up to 25MB and view them with zoom and navigation controls
- **AI Data Extraction**: Extract invoice data using Google Gemini or Groq AI
- **Invoice Management**: Full CRUD operations for invoice records
- **Search & Filter**: Search invoices by vendor name or invoice number
- **Responsive UI**: Modern interface built with Next.js and shadcn/ui
- **MongoDB Storage**: Persistent data storage with MongoDB Atlas

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

- **apps/web**: Next.js frontend with TypeScript and shadcn/ui
- **apps/api**: Node.js backend with Express and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI Services**: Google Gemini and Groq integration

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (optional)
- Groq API key (optional)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for both apps
npm run install:all
```

### 2. Environment Configuration

#### API Environment (apps/api/.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Web Environment (apps/web/.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup

1. Create a MongoDB Atlas cluster or use local MongoDB
2. Update the `MONGODB_URI` in your API environment file
3. The application will automatically create the necessary collections

### 4. AI Service Setup (Optional)

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your API environment file

#### Groq
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an API key
3. Add it to your API environment file

## 🚀 Running the Application

### Development Mode

```bash
# Start both web and API in development mode
npm run dev
```

This will start:
- Web app on http://localhost:3000
- API server on http://localhost:3001

### Production Build

```bash
# Build both applications
npm run build

# Start in production mode
npm run start
```

## 📁 Project Structure

```
pdf-viewer-dashboard/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities
│   │   └── package.json
│   └── api/                 # Node.js backend
│       ├── src/
│       │   ├── config/      # Database config
│       │   ├── models/      # Mongoose models
│       │   ├── routes/      # Express routes
│       │   ├── services/    # Business logic
│       │   └── index.ts     # Server entry point
│       └── package.json
├── package.json             # Root package.json
├── turbo.json              # Turborepo config
└── README.md
```

## 🔧 API Endpoints

### Upload
- `POST /api/upload` - Upload PDF file

### Extraction
- `POST /api/extract` - Extract data from PDF using AI

### Invoices
- `GET /api/invoices` - List invoices (with search)
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

## 📊 Data Model

```typescript
interface Invoice {
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
  createdAt: string;
  updatedAt?: string;
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Deploy API**:
   ```bash
   cd apps/api
   vercel --prod
   ```

2. **Deploy Web App**:
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Environment Variables**: Set the environment variables in Vercel dashboard for both deployments.

### Environment Variables for Production

#### API (Vercel)
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `FRONTEND_URL` (your deployed web app URL)

#### Web (Vercel)
- `NEXT_PUBLIC_API_URL` (your deployed API URL)

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **PDF not loading**: Ensure the PDF file is valid and under 25MB
2. **AI extraction failing**: Check your API keys and ensure they have sufficient credits
3. **Database connection issues**: Verify your MongoDB URI and network access
4. **CORS errors**: Ensure the frontend URL is correctly set in the API environment

### Support

For issues and questions, please create an issue in the repository.
