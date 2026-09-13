# 🚗 Car Shop Management System

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://car-shop-management-system-seven.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://car-managment-system.onrender.com)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Laravel](https://img.shields.io/badge/Laravel%2010-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

> An enterprise-grade, production-ready Full-Stack E-Commerce & Fleet Management platform for modern automotive dealerships. Engineered with an ultra-responsive React SPA frontend, containerized Laravel RESTful API backend, and cloud-hosted Supabase PostgreSQL database.

---

## 🌐 Live Demonstrations

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Portfolio & Video Demo** | Personal Portfolio | [https://my-portfolio-vert-sigma.vercel.app](https://my-portfolio-vert-sigma.vercel.app) |
| **Web Storefront (Frontend)** | Vercel | [https://car-shop-management-system-seven.vercel.app](https://car-shop-management-system-seven.vercel.app) |
| **RESTful API (Backend)** | Render (Docker) | [https://car-managment-system.onrender.com](https://car-managment-system.onrender.com) |

---

## ✨ Key Capabilities & Features

### 🛒 Real Shop & Checkout Workflow
- **Interactive Vehicle Showroom**: Browse real vehicles with dynamic filtering by brand, year, search keywords, and price sorting.
- **Ambient Lightbox Previews**: High-resolution gallery preview with backdrop blur, detailed mechanical specs, and showroom media tabs.
- **Cart & Reservation Engine**: Real-time quantity adjustments, localized subtotal calculation, and instant stock availability checks.
- **ABA QR Pay Integration**: Realistic payment verification flow with animated QR code scanning and interactive payment confirmation.

### 📍 Intelligent Geolocation & Fulfillment
- **Real-Time GPS Detection**: Automatic user geolocation detection using the browser Geolocation API and reverse address geocoding.
- **Dual Fulfillment Options**: Seamless selection between Showroom Self-Pickup (with Google Maps location pin) and Doorstep Express Delivery.
- **Executive Receipts & Invoices**: Generate official printable commercial tax invoices with unique order tracking numbers (`ORD-YYYYMMDD...`).

### 🛡️ Fleet Management & Admin Control
- **Inventory CRUD**: Create, read, update, and delete vehicle listings with instant photo uploads and stock counters.
- **Executive Order Analytics**: Revenue metric cards, payment verification stats, average order value, and fulfillment filters.
- **Audit Trail & History Logging**: Comprehensive change-tracking system that logs every car update, deletion, and restock event.
- **Role-Based Access Control**: Secure JWT/Sanctum authentication separating Customer and Admin portals.

---

## 🏗️ System Architecture

```
                                  +---------------------------+
                                  |   Vercel Cloud (React)   |
                                  |  - Single Page App (SPA)  |
                                  |  - Client-Side Routing    |
                                  +-------------+-------------+
                                                |
                                      REST API  |  JSON / HTTPS
                                                v
                                  +---------------------------+
                                  |    Render Web Service     |
                                  |  - Docker (PHP 8.4-FPM)   |
                                  |  - Nginx Reverse Proxy    |
                                  |  - Laravel 10 REST API    |
                                  +-------------+-------------+
                                                |
                                      SSL / TLS |  Port 6543
                                                v
                                  +---------------------------+
                                  |   Supabase Cloud (DB)     |
                                  |  - Managed PostgreSQL     |
                                  |  - Automated Seeders      |
                                  +---------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 19** + **Vite 7** | High-performance SPA with instant HMR and optimized production bundles |
| **Styling** | **Tailwind CSS v4** + **React Icons** | Modern design system, sleek cards, micro-animations, zero emoji dependencies |
| **Backend** | **Laravel 10** + **PHP 8.4** | Enterprise REST API, Eloquent ORM, Laravel Sanctum authentication |
| **Container** | **Docker** + **Alpine Linux** | Production multi-process container with PHP-FPM and Nginx |
| **Database** | **Supabase (PostgreSQL)** | Cloud relational database with connection pooling and SSL encryption |
| **Hosting** | **Vercel** + **Render** | Distributed global CDN frontend paired with continuous Docker deployment |

---

## 🚀 Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/BIT9918/Car_Shop_Management_System.git
cd Car_Shop_Management_System
```

### 2. Backend Setup (`laravel-car`)
```bash
cd laravel-car
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```
Backend API will be running at `http://127.0.0.1:8000`.

### 3. Frontend Setup (`react-car`)
```bash
cd ../react-car
npm install
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

---

## 🔐 Pre-Configured Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `mengrithychey@gmail.com` | `Bitpromaxplus123` | Full showroom control, inventory management, order logs |
| **Customer** | `bit@gmail.com` | `password` | Showroom browsing, cart, ABA QR checkout, personal order history |

---

## 👨‍💻 Developer & Contact

**Meng Rithy Chey**  
- 🌐 Portfolio: [https://my-portfolio-vert-sigma.vercel.app](https://my-portfolio-vert-sigma.vercel.app)  
- 🐙 GitHub: [@BIT9918](https://github.com/BIT9918) / [@SATYA-C12](https://github.com/SATYA-C12)

---

⭐ *If you find this project helpful or inspiring, please consider giving it a star on GitHub!*
