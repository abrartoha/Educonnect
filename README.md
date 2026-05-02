# EduConnect Australia - Education Marketplace

A modern education marketplace platform connecting international students with Australian universities, education agents, and consultants. Built for the post-commission-ban era (April 2025+).

## Features

- **Landing Page** - Stunning hero section, features showcase, stats, testimonials, and CTA
- **AI Chat Widget** - Intelligent chatbot helping students find universities, courses, and visa info
- **Admin Panel** - Full CRUD management for universities, agents, and consultants
- **University Dashboard** - Profile management, analytics, and lead tracking
- **Agent Dashboard** - Student management, bookings, and performance metrics
- **Consultant Dashboard** - Schedule, reviews, and profile management
- **Marketplace** - Browse and compare universities, agents, and consultants
- **Role-based Auth** - Login/signup for Admin, University, Agent, Consultant, and Student roles
- **Responsive Design** - Beautiful UI that works on all devices

## Tech Stack

- **React 19** + Vite
- **Tailwind CSS v4** - Utility-first styling
- **Zustand** - State management with localStorage persistence
- **React Router v6** - Client-side routing
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

```bash
npm install
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@educonnect.com.au | admin123 |
| University | admissions@unimelb.edu.au | any |
| Agent | sarah@pacificedu.com.au | any |
| Consultant | emma.thompson@educonsult.com.au | any |

## Deployment

Configured for Vercel deployment with SPA routing:

```bash
npm run build
```

## Project Structure

```
src/
  components/
    chat/        - AI Chat widget
    landing/     - Landing page sections
    layout/      - Navbar, Sidebar, Footer, DashboardLayout
  pages/
    admin/       - Admin dashboard and management pages
    agent/       - Agent dashboard and profile
    auth/        - Login and signup pages
    consultant/  - Consultant dashboard and profile
    marketplace/ - Browse universities, agents, detail views
    university/  - University dashboard, profile, analytics
  store/         - Zustand store with all state management
  data/          - Seed data for demo
```

## License

MIT
