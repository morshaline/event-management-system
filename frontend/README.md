# EventFlow Pro Frontend

React + Vite multipage frontend for the CSE 3120 Event Management System.

## Features

- Multipage routing: Home, Events, About, Contact, Login, Register, Dashboard
- Role-aware UI for organizers and participants
- Protected dashboard route
- Responsive design system with reusable layout/components
- API integration for authentication, event CRUD, and event registration

## Folder Structure

```text
src/
  components/
    auth/
    common/
    events/
    layout/
    routing/
  config/
  context/
  hooks/
  pages/
  services/
  utils/
  App.jsx
  main.jsx
  index.css
```

## Environment

Set API and base path values in a `.env` file in `frontend` if needed:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_BASE_PATH=/
```

For GitHub Pages deployment, set:

```env
VITE_BASE_PATH=/event-management-system/
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
