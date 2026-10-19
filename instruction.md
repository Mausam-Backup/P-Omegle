# 🚀 Running the Client and Server

The project has a **React/Vite** client and a **Node.js** backend. You can start both at once from the project root, or run them in separate terminals.

---

## 📋 Requirements

| Requirement | Details |
|---|---|
| **Runtime** | Node.js `v20 LTS` or `v24+` |
| **Package Manager** | npm `v10+` (bundled with Node.js) |
| **Working Directory** | Terminal opened at the **project root** (`P-Omegle/`) |

---

## ⚡ Start Both Servers Together

From the project root, install dependencies (first time only) and start the development servers:

```bash
npm install
npm run dev
```

| Service | URL |
|---|---|
| 🌐 **Frontend** | http://localhost:5173 |
| ⚙️ **Backend REST** | http://localhost:5000 |
| 🔌 **WebSocket** | ws://localhost:5000/ws |
| 🩺 **Health Check** | http://localhost:5000/health |

> The root `dev` script uses **concurrently** to start the backend and frontend in a single terminal with colour-coded output.

---

## 🖥️ Start Them in Separate Terminals

Open two terminals, both from the **project root**.

| Terminal | Role | Command |
|---|---|---|
| **Terminal 1** | ⚙️ Backend | `npm run dev:server` |
| **Terminal 2** | 🌐 Frontend | `npm run dev:client` |

Then open **http://localhost:5173** in your browser.

---

## 🛑 Stop the Servers

| Method | Action |
|---|---|
| **Concurrent mode** | Press `Ctrl + C` in the single terminal |
| **Separate terminals** | Press `Ctrl + C` in each terminal individually |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot find module` / missing package | Run `npm install` from the project root, then retry |
| Port `5000` already in use | Stop the other process occupying port `5000` before starting |
| Port `5173` already in use | Stop the other process occupying port `5173` before starting |
| Frontend can't reach the backend | Confirm `VITE_SERVER_URL=http://localhost:5000` in `client/.env` |
| WebSocket connection refused | Confirm `VITE_WS_URL=ws://localhost:5000/ws` in `client/.env` |
