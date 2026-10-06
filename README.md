# AEMET Antarctica Weather API

Technical challenge for **GS Inima**: API and web application for querying historical weather data from AEMET Antarctic stations, with support for measurements, time aggregation, timezone conversion and local persistence.

## Objective

The project provides an API and web interface to retrieve and visualize historical weather observations from AEMET Antarctic stations.

The initial scope includes:

- **Gabriel de Castilla** — `89070`
- **Juan Carlos I** — `89064`

AEMET provides observations at approximately 10-minute intervals. The application allows users to select the date range, station, measurements and aggregation level.

## Tech stack

### Backend

- Node.js
- TypeScript
- Express
- Native `fetch`
- SQLite
- better-sqlite3
- Vitest
- Supertest
- dotenv

### Frontend

- React
- TypeScript
- Vite

## Architecture

The backend follows a simple separation of responsibilities:

Frontend → Express controller → Weather service → AEMET client / Repository → AEMET / SQLite

### Responsibilities

- **Controller**: handles HTTP requests, validates parameters and returns HTTP responses.
- **Service**: contains application logic such as filtering, aggregation and timezone conversion.
- **AEMET client**: communicates with the external AEMET API.
- **Repository**: handles SQLite persistence and cached weather observations.
- **Database**: stores source observations locally to avoid unnecessary requests to AEMET.

## Configuration

Create a `.env` file inside `backend/` with the following variable:

`AEMET_API_KEY=your_api_key`

The API key is read from the environment and is not committed to Git.

A template is provided in `backend/.env.example`.

## Running the project

### Backend

From the `backend` directory:

`npm install`

Start the development server:

`npm run dev`

Build the backend:

`npm run build`

Start the production build:

`npm start`

The API runs on `http://localhost:3000`.

### Frontend

From the `frontend` directory:

`npm install`

`npm run dev`

## Health check

`GET /api/health`

Example response:

`{ "status": "ok" }`

## API

### Get Antarctic weather data

`GET /api/antartida/datos/fechaini/{fechaIni}/fechafin/{fechaFin}/
