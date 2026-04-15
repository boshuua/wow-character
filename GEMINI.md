# Wow-Character-Finder Project

## Project Overview

This is a full-stack web application designed to fetch and display detailed World of Warcraft character information. The application provides a data-rich dashboard for a searched character, including their equipment, stats, progression, collections, and more.

- **Frontend:** Built with **Angular**, using TypeScript. It features a component-based architecture and utilizes RxJS for handling asynchronous API calls.
- **Backend:** A simple **Node.js** server using the **Express** framework. It acts as a proxy to communicate with the official Blizzard Battle.net API. Its primary responsibilities are to securely handle OAuth 2.0 authentication (managing client credentials) and to forward API requests from the frontend to the Blizzard API, avoiding CORS issues and protecting API keys.
- **Styling:** The UI is styled with pure CSS, following a modern, dark-themed dashboard aesthetic inspired by popular WoW-related tools.

## Building and Running

The application consists of two separate parts that must be run concurrently: the backend proxy and the frontend development server.

### 1. Running the Backend

The backend server is located in the `backend/` directory.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (only required on first run)
npm install

# Start the server
node server.js
```

The proxy server will start on `http://localhost:3000`.

### 2. Running the Frontend

The frontend is a standard Angular CLI project.

```bash
# Navigate to the project root directory
# (If you are in the backend directory, run: cd ..)

# Install dependencies (only required on first run)
npm install

# Start the Angular development server
npm start
```

The frontend application will be available at `http://localhost:4200/`.

## Development Conventions

- **API Interaction:** All communication with the Battle.net API is handled by the `WowApiService` (`src/app/wow-api.service.ts`). This service makes HTTP requests to the local Node.js backend proxy, which then forwards them to Blizzard.
- **Component Structure:** The main view is managed by the `CharacterSearchComponent` (`src/app/character-search/`), which is responsible for orchestrating data fetching and rendering the dashboard.
- **Error Handling:** API requests in the `WowApiService` are individually wrapped with RxJS `catchError` operators. This makes the UI resilient, allowing it to display partial data even if one or more of the numerous API endpoints fail.
- **Environment:** The backend proxy is hardcoded to the `'eu'` region. API credentials in `backend/server.js` should be replaced with your own for a production environment, preferably using environment variables.
