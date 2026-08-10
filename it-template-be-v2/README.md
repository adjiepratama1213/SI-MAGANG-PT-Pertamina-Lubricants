# 🚀 PTPL IT Template Starter Pack — Backend

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.30-blue.svg)
![NestJS](https://img.shields.io/badge/NestJS-11.1.10-ea2845.svg)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)

**Backend API template dari PTPL IT Template Starter Pack**

Starter pack backend untuk REST API modern — NestJS, Prisma, PostgreSQL, JWT, MFA, dan deployment siap pakai.

[Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Database](#-database) • [Deployment](#-deployment)

</div>

---

## 📦 Tentang PTPL IT Template Starter Pack

**PTPL IT Template Starter Pack** adalah kumpulan template frontend dan backend siap pakai dari IT PTPL untuk memulai proyek aplikasi web dengan cepat. Paket ini mencakup autentikasi (JWT, MFA), role-based access, CRUD dasar, dan konfigurasi deployment (GCP, Docker, GKE).

- **Backend** (repositori ini): NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Material-UI (repositori terpisah `it-template-fe-v2`)

---

## 📋 Deskripsi

Backend template ini adalah bagian dari **PTPL IT Template Starter Pack**. Dibangun dengan **NestJS** dan **Prisma ORM**, menyediakan dasar API yang siap dipakai: autentikasi (JWT, MFA), manajemen user/organisasi, dan integrasi dengan frontend template.

### Fitur Utama

- 🔐 **Authentication & Authorization** - JWT, WebAuthn, MFA (Multi-Factor Authentication)
- 📝 **Post Management** - CRUD operations untuk posts dengan tag dan team organization
- 📰 **Blog Management** - Blog creation, publishing, dan content management
- 👥 **Team & Squad Management** - Team collaboration dan squad-based organization
- 📋 **Custom Forms** - Dynamic form builder dengan berbagai question types
- 🤖 **Generative AI** - AI-powered content generation
- 📊 **Analytics** - Dashboard data dan user activity tracking
- 📧 **Email Service** - Email notifications dan templates
- 🔍 **Search & Filtering** - Advanced search dengan multiple filters

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11.1.10
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/) v7.2.0
- **Authentication**: 
  - JWT (JSON Web Tokens)
  - Passport.js
  - WebAuthn
  - OTP (One-Time Password) dengan otplib
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI (@nestjs/swagger)
- **Testing**: Jest
- **Cloud Services**:
  - Google Cloud Storage
  - Google Cloud BigQuery
  - Google Vertex AI

---

## 📦 Prerequisites

- **Node.js**: >= 18.x
- **pnpm**: >= 8.x (recommended) or npm >= 9.x
- **PostgreSQL**: >= 14.x
- **Docker**: (optional, for local database)

---

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
pnpm install
```

### 2. Environment Setup

Buat file `.env` di root project (lihat `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/post-it?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Security
ENCRYPTION_KEY=your-encryption-key-for-mfa

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@postit.com

# Google Cloud Platform
GCP_PROJECT_ID=your-project-id
GCP_STORAGE_BUCKET=your-bucket-name
GCP_KEY_FILE=path/to/service-account-key.json

# Application
PORT=3100
NODE_ENV=development
```

### 3. Database Setup

#### Option A: Using Docker (Recommended for Local Development)

```bash
# Start PostgreSQL container
docker-compose -f compose.local.yml up -d

# Access database
docker ps -a
docker exec -it <container_id> bash
psql -h localhost -U postgres
# Password: pass123

# Create database
CREATE DATABASE "post-it";
```

Update `.env`:
```env
DATABASE_URL="postgresql://postgres:pass123@localhost:5432/post-it?schema=public"
```

#### Option B: Using Existing PostgreSQL

Pastikan database sudah dibuat dan `DATABASE_URL` di `.env` sudah benar.

### 4. Database Migration & Seeding

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
# Development mode with hot reload
pnpm run start:dev

# Server will run on http://localhost:3100
```

---

## 📚 API Documentation

### Swagger UI

Setelah server berjalan, akses API documentation di:

- **Development**: `http://localhost:3100/api`
- **Production**: `https://api.postit.com/api`

### API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

#### MFA (Multi-Factor Authentication)
- `POST /mfa/generate` - Generate QR code for MFA setup
- `POST /mfa/verify` - Verify OTP code
- `POST /mfa/validate` - Validate MFA during login
- `POST /mfa/disable` - Disable MFA
- `POST /mfa/backup-codes` - Generate backup codes

#### Posts
- `GET /post-item` - Get all posts (with filters)
- `GET /post-item/:id` - Get post by ID
- `POST /post-item` - Create new post
- `PATCH /post-item/:id` - Update post
- `DELETE /post-item/:id` - Delete post

#### Teams
- `GET /team` - Get all teams
- `GET /team/:id` - Get team by ID
- `POST /team` - Create new team
- `PATCH /team/:id` - Update team

#### Users
- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `PATCH /user/:id` - Update user

#### Custom Forms
- `GET /custom-form` - Get all custom forms
- `POST /custom-form` - Create custom form
- `POST /custom-form/:id/submit` - Submit form response

---

## 🗄️ Database

### Prisma Schema

Database schema didefinisikan di `prisma/schema.prisma`. Untuk melihat dan mengelola database:

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio
# Will open at http://localhost:5555
```

### Database Models

#### Core Models
- **User** - User accounts dengan role-based access
- **Organization** - Organizational structure
- **Position** - Job positions
- **Tag** - Content tags untuk categorization

#### Content Models
- **PostItem** - Posts dengan tags dan team associations
- **BlogItem** - Blog posts
- **BlogUploadItem** - Uploaded blog items

#### Collaboration Models
- **Squad** - Team collaboration spaces
- **SquadMember** - Squad membership
- **SquadPostItem** - Squad-specific posts

#### Form Models
- **CustomForm** - Dynamic form definitions
- **Question** - Form questions
- **Form** - Form submissions
- **Response** - Form responses

### Changing Database Schema

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name your-migration-name

# 3. Generate Prisma Client
npx prisma generate

# 4. (Optional) Seed database
npx prisma db seed
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e

# Coverage report
pnpm run test:cov

# Debug tests
pnpm run test:debug
```

---

## 🏗️ Build & Production

### Build

```bash
# Build for production
pnpm run build

# Output will be in dist/
```

### Production Run

```bash
# Run with database migration
pnpm run start:migrate:prod

# Or run without migration
pnpm run start:prod
```

### Docker Build

```bash
# Development
pnpm run docker:dev:build
pnpm run docker:dev:push

# Production
pnpm run docker:prd:build
pnpm run docker:prd:push
```

---

## ☁️ Deployment

### Google Cloud Platform (GCP)

#### Prerequisites

```bash
# Initialize gcloud
gcloud init
gcloud auth application-default login

# Configure Docker for GCR
gcloud auth configure-docker asia-southeast2-docker.pkg.dev
```

#### Development Deployment

```bash
# Build and push Docker image
pnpm run docker:dev:build
pnpm run docker:dev:push

# Deploy to GKE
pnpm run gke:dev:deploy
```

#### Production Deployment

```bash
# Build and push Docker image
pnpm run docker:prd:build
pnpm run docker:prd:push

# Deploy to GKE
pnpm run gke:prd:deploy
```

### Kubernetes Secrets

Update environment variables:

```bash
# Edit secret file
# devops/dev/postit-api-secret.yaml (for dev)
# devops/prod/postit-api-secret.yaml (for prod)

# Apply secrets
kubectl apply -f devops/dev/postit-api-secret.yaml
# or
kubectl apply -f devops/prod/postit-api-secret.yaml
```

### Service Account Setup

```bash
# Add IAM policy binding
gcloud iam service-accounts add-iam-policy-binding \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:ptpl-devops-dev.svc.id.goog[default/postit-api-sa]" \
  postit@ptpl-devops-dev.iam.gserviceaccount.com

# Annotate service account
kubectl annotate serviceaccount \
  postit-api-sa \
  iam.gke.io/gcp-service-account=postit@ptpl-devops-dev.iam.gserviceaccount.com
```

---

## 🔐 Security

### Authentication Flow

1. **Login** - User login dengan email/password
2. **MFA Setup** (Optional) - Setup MFA dengan QR code
3. **MFA Verification** - Verify OTP atau backup code
4. **Token Generation** - Generate JWT access & refresh tokens

### Environment Variables Security

- JWT secrets harus kuat dan unik
- Encryption key untuk MFA harus aman
- Database credentials jangan di-commit ke repository
- Gunakan Kubernetes Secrets untuk production

---

## 📊 Code Quality

### Linting

```bash
# Check linting errors
pnpm run lint

# Fix linting errors
pnpm run lint:fix
```

### Formatting

```bash
# Format code
pnpm run format
```

### SonarQube

```bash
# Run SonarQube analysis
pnpm run sonar
```

---

## 📁 Project Structure

```
api/
├── src/
│   ├── auth/              # Authentication & Authorization
│   ├── post-item/          # Post management
│   ├── blog-item/          # Blog management
│   ├── blog-upload-item/   # Blog upload management
│   ├── squad/              # Squad/Team collaboration
│   ├── squad-post-item/    # Squad posts
│   ├── custom-form/        # Custom form builder
│   ├── user/               # User management
│   ├── team/               # Team management
│   ├── position/           # Position management
│   ├── tag/                # Tag management
│   ├── mfa/                # Multi-Factor Authentication
│   ├── mail/               # Email service
│   ├── gcp-item/           # Google Cloud Platform integration
│   ├── post-generative-ai/ # AI content generation
│   ├── dashboard/          # Dashboard analytics
│   ├── news/               # News management
│   ├── bquery/             # BigQuery integration
│   ├── health/             # Health checks
│   ├── prisma/             # Prisma service
│   └── common/             # Common utilities & configs
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts             # Database seed
├── devops/
│   ├── Dockerfile          # Docker configuration
│   ├── dev/                # Development deployment configs
│   └── prod/               # Production deployment configs
└── test/                   # Test files
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `start` | Start production server |
| `start:dev` | Start development server with hot reload |
| `start:debug` | Start debug mode |
| `start:prod` | Start production server |
| `start:migrate:prod` | Run migrations and start production server |
| `build` | Build for production |
| `test` | Run unit tests |
| `test:e2e` | Run E2E tests |
| `test:cov` | Generate test coverage |
| `lint` | Check linting errors |
| `lint:fix` | Fix linting errors |
| `format` | Format code with Prettier |
| `docker:dev:build` | Build Docker image for dev |
| `docker:dev:push` | Push Docker image to dev registry |
| `docker:prd:build` | Build Docker image for prod |
| `docker:prd:push` | Push Docker image to prod registry |
| `gke:dev:deploy` | Deploy to GKE dev environment |
| `gke:prd:deploy` | Deploy to GKE prod environment |
| `sonar` | Run SonarQube analysis |

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker ps

# Check database connection
psql -h localhost -U postgres -d post-it

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset
npx prisma db seed
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Check Prisma version
npx prisma --version
```

### Port Already in Use

```bash
# Find process using port 3100
lsof -i :3100

# Kill process
kill -9 <PID>
```

---

## 📞 Support

Untuk bantuan dan pertanyaan:

- **Email**: kuncoro.baroto@pertamina.com
- **Internal Support**: Contact IT Team

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

<div align="center">

**PTPL IT Template Starter Pack** — Backend

Made with ❤️ by IT PTPL Team • [PT Pertamina Lubricants](https://www.pertaminalubricants.com/)

</div>
