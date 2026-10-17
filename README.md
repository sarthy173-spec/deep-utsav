# Deep Utsav — Diwali shopping website

A complete learning project by Sarthak: a React storefront, Python Flask API, Docker image and local Kubernetes configuration. Includes generated festive product photos, search, category filters, sorting, persistent browser cart, quantity controls and demo order creation.

**Start here:** Open `START-HERE.md` for the full beginner walkthrough. In VS Code, select the file and press **Ctrl+Shift+V** to read it as a formatted page.

## Run the complete website

Install and start Docker Desktop, open this folder in VS Code, choose Terminal → New Terminal, then run:

```powershell
docker compose up --build
```

Open **http://localhost:8000**. Stop with Ctrl+C, then `docker compose down`.

## What this version does

- Serves four sample products with prices in Indian rupees.
- Filters by category, searches by name/description and sorts prices.
- Stores the cart in your browser when local storage is available.
- Creates practice orders in SQLite with server-calculated prices and delivery.
- Handles retrying the same order request without duplicating it while retained.
- Keeps the most recent 1,000 demo orders; stores no customer personal information.
- Uses one Docker image for both the frontend and backend.

**Demo only:** no real payments, shipping, account login, inventory reservations, seller dashboard, email notifications or customer order-history screen. Photos are AI-generated examples. Replace the images and sample product descriptions with your own before selling. Real sales need durable database hosting, authenticated order management, stock transactions, payment-provider integration, customer-data protection and store policies. Never enter payment-card details into this demo.

## Project map

| File | Purpose |
| --- | --- |
| `frontend/index.html` | HTML entry page |
| `frontend/src/main.jsx` | React interface, cart and API calls |
| `frontend/src/styles.css` | Responsive cream, maroon and gold styling |
| `frontend/public/images/` | Four bundled festive images |
| `frontend/package.json` | JavaScript dependencies and commands |
| `frontend/package-lock.json` | Exact JavaScript dependency versions |
| `frontend/vite.config.js` | Local React server and API proxy |
| `backend/app.py` | Python API, validation, orders and static-file serving |
| `backend/products.json` | Editable product catalogue |
| `backend/requirements.txt` | Python dependencies |
| `backend/test_app.py` | API tests |
| `Dockerfile` | Builds React, then packages it with Python |
| `compose.yaml` | Runs the container with a local database volume |
| `k8s/shop.yaml` | Namespace, storage, deployment and service |
| `.gitignore` | Files Git must leave out |
| `.dockerignore` | Files Docker must leave out |
| `START-HERE.md` | Setup, coding, GitHub, free hosting and Kubernetes guide |
| `IMAGE-NOTES.md` | Image generation details and prompts |
| `VERIFICATION.md` | Actual checks and verification limits |

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health response |
| GET | `/api/products` | Catalogue |
| POST | `/api/orders` | Create a demo order |

The order body contains a UUID `request_id` and `items`, each with integer `id` and `quantity`. The browser creates the UUID automatically. The server validates IDs, disallows duplicate product lines and limits quantities to 1–10. Prices use integer paise (₹299 = 29,900 paise); the server ignores client-supplied prices. Demo delivery is ₹59 below ₹999 and free at or above ₹999.

## Tests

From `backend`, with Python dependencies installed:

```powershell
python -m unittest -v
```

## Hosting

The beginner guide deploys this Docker image to Render's Free web-service plan. Kubernetes is a separate local learning exercise. GitHub stores the source; GitHub Pages cannot run this Python backend.

The project has not been pushed to your GitHub account or deployed to your hosting account. Follow the account-specific steps in `START-HERE.md`.
