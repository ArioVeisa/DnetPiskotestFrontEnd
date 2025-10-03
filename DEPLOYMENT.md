# Deployment Guide - Vercel

## 🚀 Cara Deploy ke Vercel

### 1. Persiapan Environment Variables

Di Vercel dashboard, tambahkan environment variable:
- `NEXT_PRIVATE_API_URL` = `https://humble-space-broccoli-rv46xjr57g5fpxp6-8000.app.github.dev`

### 2. Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Deploy via GitHub (Recommended)

1. Push code ke GitHub repository
2. Connect repository ke Vercel
3. Vercel akan otomatis deploy setiap push ke main branch

### 4. Konfigurasi CORS di Backend

Pastikan backend sudah dikonfigurasi untuk menerima request dari domain Vercel:
- Tambahkan domain Vercel ke CORS allowed origins
- Domain Vercel akan seperti: `https://your-app-name.vercel.app`

## 📁 File Konfigurasi

- ✅ `vercel.json` - Konfigurasi Vercel
- ✅ `.env.example` - Template environment variables
- ✅ `DEPLOYMENT.md` - Panduan deployment ini

## 🔧 API Proxy

Aplikasi menggunakan Next.js API routes sebagai proxy untuk menghindari CORS:
- `/api/login` → Backend login
- `/api/logout` → Backend logout  
- `/api/user` → Backend user session
- `/api/candidates` → Backend candidates
- `/api/test-package` → Backend test packages

## ⚠️ Catatan Penting

1. **Environment Variables**: Pastikan `NEXT_PRIVATE_API_URL` sudah diset di Vercel
2. **CORS**: Backend harus mengizinkan domain Vercel
3. **API Routes**: Semua API routes sudah siap untuk production
4. **Authentication**: Token-based auth sudah dikonfigurasi dengan benar
