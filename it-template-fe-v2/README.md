# 🎨 PTPL IT Template Starter Pack — Frontend

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.24-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF.svg)
![Material-UI](https://img.shields.io/badge/MUI-5.16.4-007FFF.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)

**Frontend template dari PTPL IT Template Starter Pack**

Starter pack frontend untuk aplikasi web modern — React, Vite, Material-UI, auth, dashboard, dan deployment siap pakai.

[Getting Started](#-getting-started) • [Features](#-features) • [Development](#-development) • [Deployment](#-deployment)

</div>

---

## 📦 Tentang PTPL IT Template Starter Pack

**PTPL IT Template Starter Pack** adalah kumpulan template frontend dan backend siap pakai dari IT PTPL untuk memulai proyek aplikasi web dengan cepat. Paket ini mencakup autentikasi, role-based access, dashboard, manajemen user/team, dan konfigurasi deployment (GCP, Docker, Cloud Run/GKE).

- **Frontend** (repositori ini): React + Vite + Material-UI
- **Backend**: NestJS + Prisma + PostgreSQL (repositori terpisah `it-template-be-v2`)

---

## 📋 Deskripsi

Frontend template ini adalah bagian dari **PTPL IT Template Starter Pack**. Dibangun dengan **React 18**, **Vite**, dan **Material-UI**, menyediakan dasar yang siap dipakai untuk aplikasi web modern: auth, layout dashboard, manajemen user/team, dan integrasi dengan backend template.

### Fitur Utama

- 🎨 **Modern UI/UX** - Material-UI dengan custom theme dan animasi
- 📱 **Responsive Design** - Mobile-first approach dengan breakpoints yang optimal
- 🔐 **Authentication** - JWT-based auth dengan MFA support
- 📝 **Content Management** - Post, blog, dan dokumentasi management
- 👥 **Team Collaboration** - Squad-based collaboration dengan real-time updates
- 📋 **Custom Forms** - Dynamic form builder dengan berbagai input types
- 🔍 **Advanced Search** - Powerful search dengan multiple filters
- 📊 **Dashboard Analytics** - Interactive dashboard dengan data visualization
- 🤖 **AI Integration** - Generative AI untuk content creation
- 🎭 **Animations** - Smooth animations dengan Framer Motion

---

## 🛠️ Tech Stack

### Core
- **Framework**: [React](https://react.dev/) 18.3.1
- **Build Tool**: [Vite](https://vitejs.dev/) 5.4.21
- **Language**: TypeScript 5.5.3

### UI & Styling
- **UI Library**: [Material-UI (MUI)](https://mui.com/) v5.16.4
- **Icons**: [Iconify](https://iconify.design/) React
- **Animation**: [Framer Motion](https://www.framer.com/motion/) 11.3.8
- **Styling**: Emotion (CSS-in-JS)

### State Management & Data Fetching
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query) 5.51.11
- **Form Management**: [React Hook Form](https://react-hook-form.com/) 7.69.0
- **Form Validation**: [Yup](https://github.com/jquense/yup) 1.7.1

### Routing & Navigation
- **Routing**: [React Router](https://reactrouter.com/) v6.30.2
- **History**: history 5.3.0

### Additional Libraries
- **Charts**: ApexCharts, React ApexCharts
- **File Handling**: jsPDF, xlsx, docx
- **Date Handling**: date-fns 3.6.0
- **HTTP Client**: Axios 1.13.5
- **Notifications**: React Toastify, Notistack
- **Rich Text Editor**: Jodit React
- **Markdown**: React Markdown

---

## 📦 Prerequisites

- **Node.js**: >= 16.x || 18.x
- **Package Manager**: 
  - **pnpm** (recommended) >= 8.x
  - **npm** >= 9.x
  - **yarn** >= 1.x

---

## 🚀 Getting Started

### 1. Installation

#### Using pnpm (Recommended)

```bash
pnpm install
```

#### Using npm

```bash
npm install
# or if you encounter peer dependency issues
npm install --legacy-peer-deps
```

#### Using yarn

```bash
yarn install
```

### 2. Environment Setup

Buat file `.env` di root project (lihat `.env.example`):

```env
# API Configuration
VITE_API_URL=http://localhost:3100

# Environment
VITE_NODE_ENV=development

# Google Maps (if needed)
VITE_MAPBOX_API=your-mapbox-api-key

# Other environment variables...
```

### 3. Run Development Server

```bash
# Using pnpm
pnpm run dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port yang tersedia).

---

## 🏗️ Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build for production |
| `build:run` | Build and serve locally |
| `build:deploy` | Build and deploy to Google Cloud Storage |
| `start` | Preview production build |
| `start:dev` | Build and start preview server |
| `lint` | Check linting errors |
| `lint:fix` | Fix linting errors automatically |
| `prettier` | Format code with Prettier |
| `clear-all` | Remove all build artifacts and node_modules |
| `re-start` | Clean install and start dev server |
| `re-build` | Clean install and build |
| `sonar` | Run SonarQube analysis |

### Code Quality

#### Linting

```bash
# Check for linting errors
pnpm run lint

# Auto-fix linting errors
pnpm run lint:fix
```

#### Formatting

```bash
# Format all files with Prettier
pnpm run prettier
```

#### SonarQube

```bash
# Run SonarQube code analysis
pnpm run sonar
```

---

## 📁 Project Structure

```
fe2/
├── src/
│   ├── assets/              # Static assets (images, icons, etc.)
│   ├── auth/                # Authentication logic & guards
│   ├── components/           # Reusable React components
│   │   ├── animate/         # Animation components
│   │   ├── chatbot/         # Chatbot component
│   │   ├── hook-form/       # Form components
│   │   ├── settings/         # Settings components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── layouts/              # Layout components
│   │   ├── main/            # Main layout
│   │   └── dashboard/       # Dashboard layout
│   ├── locales/             # i18n translations
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── post/            # Post management pages
│   │   ├── blog/            # Blog pages
│   │   ├── squad/           # Squad pages
│   │   ├── user-mgmt/       # User management
│   │   ├── team-mgmt/       # Team management
│   │   └── ...
│   ├── theme/               # Material-UI theme configuration
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Application entry point
├── public/                  # Public static files
│   ├── assets/             # Public assets
│   └── ...
├── devops/                  # Deployment configurations
│   ├── Dockerfile          # Docker configuration
│   └── ...
└── dist/                    # Production build output
```

---

## 🎨 UI Components

Komponen UI dalam template ini mengacu pada **[Minimal UI Kit](https://minimals.cc/components)** untuk konsistensi desain dan pola komponen.

### Core Components

- **Layout Components**: Main layout, Dashboard layout, Compact layout
- **Form Components**: RHFTextField, RHFSelect, RHFUpload, RHFEditor
- **Data Display**: Tables, Cards, Lists, Charts
- **Navigation**: Breadcrumbs, Sidebar, Topbar
- **Feedback**: Alerts, Snackbars, Loading states
- **Authentication**: Login, Register, MFA components

### Custom Components

- **MotionViewport**: Viewport-based animation wrapper
- **Iconify**: Icon component wrapper
- **Image**: Optimized image component
- **RouterLink**: Custom router link component
- **Chatbot**: AI chatbot integration
- **ClockRunning**: Real-time clock component

---

## 🔐 Authentication

### Authentication Flow

1. **Login** - User login dengan email/password
2. **MFA Setup** (First time) - Setup MFA dengan QR code
3. **MFA Verification** - Verify OTP code
4. **Session Management** - JWT token management
5. **Route Guards** - Protected routes dengan AuthGuard

### Protected Routes

Routes yang memerlukan authentication:
- `/dashboard/*` - Dashboard pages
- `/post/*` - Post management
- `/blog-management/*` - Blog management
- `/user-management/*` - User management
- `/team-management/*` - Team management
- `/squad/*` - Squad pages

---

## 📱 Responsive Design

Aplikasi menggunakan Material-UI breakpoints:

- **xs**: 0px - Extra small devices (phones)
- **sm**: 600px - Small devices (tablets)
- **md**: 900px - Medium devices (desktops)
- **lg**: 1200px - Large devices
- **xl**: 1536px - Extra large devices

### Mobile-First Approach

Semua komponen dirancang dengan mobile-first approach untuk optimal experience di semua device.

---

## 🎭 Animations

Aplikasi menggunakan **Framer Motion** untuk smooth animations:

- **Page Transitions**: Fade, slide, scale animations
- **Component Animations**: Hover effects, entrance animations
- **Viewport Animations**: Animate on scroll
- **Loading States**: Skeleton loaders dan loading spinners

---

## 🏗️ Build & Production

### Build for Production

```bash
# Build production bundle
pnpm run build

# Output will be in dist/
```

### Preview Production Build

```bash
# Preview production build locally
pnpm run start
# or
pnpm run build:run
```

---

## ☁️ Deployment

### Google Cloud Platform (GCP)

#### Prerequisites

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login
gcloud config set project ptpl-devops-dev  # or ptpl-devops-prod
```

#### Development Deployment

```bash
# Build Docker image
pnpm run docker:dev:build

# Push to container registry
pnpm run docker:dev:push

# Deploy to Cloud Run
pnpm run cloudrun:dev:deploy
```

#### Production Deployment

```bash
# Build Docker image
pnpm run docker:prd:build

# Push to container registry
pnpm run docker:prd:push

# Deploy to Cloud Run
pnpm run cloudrun:prd:deploy
```

### Google Cloud Storage Deployment

```bash
# Build and deploy to GCS bucket
pnpm run build:deploy
```

### Custom Domain Setup

```bash
# Check verified domains
gcloud domains list-user-verified

# Setup domain mapping (for non-southeast-2-jakarta)
gcloud beta run domain-mappings create \
  --service post-it-fe \
  --domain staging-post.pertaminalubricants.com

# Setup domain mapping (for southeast-2-jakarta)
gcloud beta run integrations create \
  --type=custom-domains \
  --parameters='set-mapping=staging-post.pertaminalubricants.com:post-it-fe'
```

### GitHub Actions Deployment

1. Create workflow file `.github/workflows/deployment.yaml`
2. Create secrets at GitHub project settings
3. Encode production env file: `cat .env.production | base64`
4. Add encoded value to GitHub secrets
5. Push commit to trigger deployment

---

## 🧪 Testing

```bash
# Run tests (if configured)
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Build Issues

```bash
# Clean all build artifacts
pnpm run clear-all

# Reinstall dependencies
pnpm install

# Rebuild
pnpm run build
```

### Dependency Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Regenerate types
pnpm run build
```

---

## 📊 Performance Optimization

### Code Splitting

- Route-based code splitting dengan React.lazy()
- Component lazy loading untuk heavy components
- Dynamic imports untuk libraries

### Image Optimization

- Lazy loading images
- Responsive images dengan srcset
- WebP format support

### Bundle Optimization

- Tree shaking untuk unused code
- Minification dan compression
- Vite build optimizations

---

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.node.json` - Node TypeScript config
- `.eslintrc.*` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `sonar-project.properties` - SonarQube configuration

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

**PTPL IT Template Starter Pack** — Frontend

Made with ❤️ by IT PTPL Team • [PT Pertamina Lubricants](https://www.pertaminalubricants.com/)

</div>
