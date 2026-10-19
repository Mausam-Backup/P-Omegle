# Running the Client and Server

The project has a React/Vite client and a Node.js backend. You can start both
at once from the project root, or run them in separate terminals.

## Requirements

- Node.js and npm installed
- A terminal opened in the project root

## Start both servers together

From the project root, install dependencies (first time only) and start the
development servers:

```bash
npm install
npm run dev
```

The root `dev` script starts the backend and frontend concurrently. Open
**http://localhost:5173** in your browser. The backend runs at
**http://localhost:5000**.

## Start them in separate terminals

Open two terminals, and run both commands from the project root.

Terminal 1 — backend:

```bash
npm run dev:server
```

Terminal 2 — frontend:

```bash
npm run dev:client
```

Then open **http://localhost:5173**. The backend health endpoint is
**http://localhost:5000/health**.

## Stop the servers

Press **Ctrl+C** in the terminal running the servers.

## Troubleshooting

- If a command reports that a package is missing, run `npm install` from the
  project root, then try again.
- If port `5000` or `5173` is already in use, stop the other process using that
  port before starting the development servers.
- The frontend uses `http://localhost:5000` for API requests and
  `ws://localhost:5000/ws` for WebSocket connections by default.
