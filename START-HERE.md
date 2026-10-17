# Build and run your Diwali shop — beginner guide

Welcome, Sarthak. Your website is named **Deep Utsav**. You can rename it later. You already have all the source files: you do not need to copy hundreds of lines from chat or create the folders manually.

Follow the phases in order. Complete Phase 1 before installing Kubernetes. Commands below are for **Windows PowerShell inside VS Code** unless stated otherwise. The Docker commands also work on macOS/Linux.

## Phase 1 — See your website on your computer

### 1. Extract the project

1. Download `Deep-Utsav-Complete-Project.zip`.
2. Right-click the ZIP → **Extract All**. Do not work inside the compressed ZIP.
3. Move the extracted `deep-utsav` folder somewhere easy, for example `C:\Projects\deep-utsav`.
4. Open VS Code → **File → Open Folder** → choose `deep-utsav`.
5. The left Explorer panel should show `Dockerfile`, `compose.yaml`, `backend` and `frontend` directly. If it shows only another `deep-utsav` folder, open that inner folder instead.
6. Click `START-HERE.md`, then press **Ctrl+Shift+V** for a readable guide preview.

### 2. Install the tools

For the easiest first run, you only need VS Code and Docker Desktop. Python and Node are installed inside the Docker image automatically.

| Tool | Get it from | Why it is needed |
| --- | --- | --- |
| VS Code | https://code.visualstudio.com/ | Open and edit your code |
| Docker Desktop | https://docs.docker.com/desktop/setup/install/windows-install/ | Run the complete project in a container |
| Git | https://git-scm.com/downloads | Track changes and upload code to GitHub |
| Python 3.12 | https://www.python.org/downloads/ | Optional: edit/run the backend without Docker |
| Node.js 22.12+ or Node 24 LTS | https://nodejs.org/ | Optional: edit/run React without Docker |

Use the installers appropriate to your machine. In the Python installer, enable **Add python.exe to PATH**. After installing tools, close and reopen VS Code so its terminal can find them. Docker Desktop should use **Linux containers**.

If Docker asks for WSL 2, follow its installer guidance. On a supported Windows system, open PowerShell as Administrator and run `wsl --install`, restart Windows, and complete any first-run Linux username/password setup. If WSL is already installed, use `wsl --update` rather than reinstalling it. Hardware virtualization must be enabled. See the linked Docker page for current Windows and hardware requirements.

### 3. Start Docker Desktop

Open Docker Desktop and wait until its engine is running. Keep it open. Then in VS Code select **Terminal → New Terminal**.

Check Docker:

```powershell
docker --version
docker compose version
docker info
```

The last command must show server information, not a connection error. At the terminal prompt, you should be inside the project folder. Otherwise run:

```powershell
cd C:\Projects\deep-utsav
```

Use your real extraction path if you chose a different location.

### 4. Run one command

```powershell
docker compose up --build
```

The first run downloads Python, Node and dependencies, builds React and starts the server. This can take several minutes. The command stays running: that is expected. Do not type more commands into that occupied terminal.

Open your browser and visit:

**http://localhost:8000**

You should see a cream-and-maroon Diwali storefront with product images. You do not open `index.html` by double-clicking it; the Python server serves the website.

### 5. Try the complete flow

1. Choose **Panatis** to filter the catalogue.
2. Type `lotus` in search, then clear search and select **All**.
3. Change sorting to **Price: low to high**.
4. Click **Add to bag** on a product.
5. Open **Bag**, change its quantity, and check the total.
6. Click **Place demo order**. You should receive a reference beginning `DU-`.
7. Confirm that no payment or address was requested. This is intentional: it is a practice order.

All product photos are bundled, so there are no external image links to break. Fonts use Google Fonts when reachable and fall back to standard fonts otherwise.

### 6. Stop and restart

Press **Ctrl+C** in the running terminal. Then run:

```powershell
docker compose down
```

The named database volume stays on your computer. To start again:

```powershell
docker compose up
```

After changing code or products, rebuild with `docker compose up --build`. To run in the background, use `docker compose up -d --build`; see logs using `docker compose logs -f shop`.

**Checkpoint:** your first goal is the website opening at localhost:8000. Finish this before continuing.

## Phase 2 — Understand what you built

| Technology | Its job in this project |
| --- | --- |
| HTML | Provides the page and the element where React appears |
| CSS | Controls colours, spacing, fonts and mobile layout |
| JavaScript + React | Updates products, search, cart and order confirmation |
| Python + Flask | Answers API requests, validates orders and calculates totals |
| JSON | Holds the sample catalogue and carries data between browser and server |
| SQLite | Stores demo order receipts in a file |
| Vite | Builds the React source into browser-ready files |
| Docker | Packages the app and runtime dependencies into one image |
| Docker Compose | Starts that image with ports and local storage configured |
| Kubernetes | Keeps a container running and connects it to storage and networking |
| Git / GitHub | Tracks versions / hosts your source repository |
| Render | Runs the Docker app on an online server |

Flask is the Python framework chosen for this small beginner project; you do not need Django for this version.

When someone opens the page, React requests `/api/products`. Flask reads the catalogue and returns JSON. React renders product cards. Clicking Add to bag updates React state and saves the cart to the browser. Checkout sends only product IDs and quantities. Python looks up trusted prices, calculates delivery, stores a demo receipt and returns its reference.

In Docker and on Render, Flask serves both the built React files and the API on one address. In local coding mode, Vite runs on port 5173 and proxies `/api` requests to Python on port 8000. This avoids needing cross-origin configuration.

The Dockerfile has two stages. Node builds React in the first stage. The smaller Python image receives only the built frontend and Python backend in the second stage. Gunicorn serves Python inside Linux containers; the Flask development server is used only for local coding.

## Phase 3 — Edit the website in VS Code

### Change the shop name or heading

Open `frontend/src/main.jsx`. Press **Ctrl+F**, search for `deep utsav`, and replace the visible brand text with your chosen name. Also update `frontend/index.html` for the browser tab title and description. Save with **Ctrl+S**.

### Change colours

Open `frontend/src/styles.css`. Near the beginning, `--wine:#702537` sets the main maroon colour. Change that value, save and rebuild Docker. Other CSS rules control each section; search for `.hero`, `.product-grid` or `.story` to find them.

### Change products and prices

Open `backend/products.json`. Each object is one product. For example, product 1 has `price_paise: 29900`, meaning ₹299. To charge ₹349 in the demo, change it to `34900`. JSON requires double quotes and commas between objects; do not leave a trailing comma after the final object.

Keep the four current IDs if you are only changing names, descriptions and prices. This starter's cart validation and API order limit are configured for four products. To expand the catalogue, also update `readCart()` in `frontend/src/main.jsx` to accept the additional IDs; the backend derives its product limit from the catalogue, but its error wording should also be updated.

### Replace photos

Put your own product images in `frontend/public/images/`. Change the product's `image` value to a path such as `/images/my-panati.jpg`. For the large banner, change the hero image path in `main.jsx`. Match the actual file extension and capitalization. Use photos of the products you genuinely sell.

### Optional: faster editing without Docker

This mode lets React update after you save. First stop Docker so port 8000 is free. Install Python and Node from Phase 1.

Open a new terminal at the **project root**:

```powershell
python --version
node --version
npm.cmd --version
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe backend\app.py
```

This starts Python on port 8000. Leave this terminal running.

Click the **+** in the terminal panel to open a second terminal at the project root:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Now visit **http://localhost:5173**. This is the development website; port 8000 is the API. Press Ctrl+C in each terminal to stop. Python catalogue/code edits need a backend restart; React/CSS edits update automatically.

`npm.cmd` avoids the common Windows PowerShell script-policy error without changing your security settings. Using the virtual environment's Python directly avoids activation issues.

On macOS/Linux, the equivalent backend commands are:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
.venv/bin/python backend/app.py
```

Use `npm ci` and `npm run dev` in the frontend terminal.

## Phase 4 — Upload the code to your GitHub

This creates a public source repository for recruiters. It does not itself run the Python website.

1. Sign into https://github.com/ or create your account.
2. Click **+ → New repository**.
3. Repository name: `deep-utsav`.
4. Select **Public** if you want recruiters to see the code.
5. Leave the options for a generated README, .gitignore and licence unchecked; the project already has its own files.
6. Click **Create repository** and copy the **HTTPS** repository URL displayed there.

Back in VS Code, open a terminal at the project root. Run:

```powershell
git --version
git init
git config user.name "Sarthak Yadav"
```

Set your commit email interactively so you do not have to paste it into chat:

```powershell
$commitEmail = Read-Host "Enter your GitHub email or GitHub no-reply email"
git config user.email "$commitEmail"
git add .
git status
```

Review the files. You should see source code, images and guides. You should not see `node_modules`, `.venv`, databases or passwords. The supplied `.gitignore` excludes generated files.

Then run:

```powershell
git commit -m "Build Deep Utsav Diwali shopping demo"
git branch -M main
$repositoryUrl = Read-Host "Paste the HTTPS repository URL copied from GitHub"
git remote add origin "$repositoryUrl"
git push -u origin main
```

Complete the GitHub sign-in in your browser if Git asks. Do not use your account password as a Git token or place credentials in project files. Refresh the repository page to see the code. The root should contain `Dockerfile`, not another nested `deep-utsav` directory.

For later updates:

```powershell
git add .
git commit -m "Update festive collection"
git push
```

Only commit after reviewing `git status`. If it reports nothing to commit, your saved files already match the latest commit.

## Phase 5 — Host the demonstration online for free

Use **Render → Web Service → Docker → Free**. This hosts both Python and React in one service. Do not choose Static Site, because this project needs Python. You do not need Kubernetes for this route.

1. Visit https://render.com/ and create/sign into your account.
2. Choose **New → Web Service**.
3. Connect GitHub and grant access to your `deep-utsav` repository.
4. Select that repository and the `main` branch.
5. Use a service name such as `deep-utsav-shop`; Render may require another name if it is taken.
6. Choose **Docker** for the runtime/language.
7. Keep the root directory blank because the Dockerfile is at repository root.
8. Set Dockerfile path to `./Dockerfile` if the form asks. Keep the build context at repository root.
9. Choose an available region convenient to your visitors and select the **Free** instance type.
10. If the form offers a health-check path, use `/api/health`.
11. Do not add a database or disk for this demo. No API keys or environment secrets are needed. The Dockerfile accepts Render's supplied `PORT`.
12. Create the web service and watch the build logs. Docker builds React and installs Python automatically; do not enter a separate npm start command.
13. Once the deployment is live, open the HTTPS `onrender.com` URL Render gives you.
14. Test the product list, cart and demo checkout at that URL. Add the actual live link to the GitHub repository's About section and your README.

Render's free service is suitable for demonstrations: it sleeps after 15 idle minutes, takes time to wake, and loses local SQLite orders on restart, redeploy or sleep. Your source catalogue and bundled images remain part of the image. Free usage is limited; review the current Free plan and usage/spend controls before deploying. Do not select a paid instance or add paid resources if your goal is zero cost. A custom purchased domain is optional; the provided subdomain is enough.

This project keeps no customer personal data. For a real shop, replace demo order storage with a durable database and implement real order/payment/stock workflows before accepting customer purchases. Render's free Postgres also has a time limit, so it is not a permanent database solution for a real business.

When auto-deploy is enabled, pushing a new commit to GitHub triggers an updated deployment. Otherwise use Render's manual deploy action for the latest commit.

**Hosting details checked 17 October 2026:** https://render.com/docs/free and https://render.com/docs/docker. Plans and account requirements can change.

## Phase 6 — Learn Kubernetes locally with Minikube

Do this after the website works. Local Kubernetes runs on your computer and does not give you a public internet address. Render deployment does not use these Kubernetes files. No always-free production Kubernetes hosting is promised here.

Keep Docker Desktop running. Install Minikube using the Windows option at https://minikube.sigs.k8s.io/docs/start/. On a Windows computer with Winget, you can use:

```powershell
winget install Kubernetes.minikube
```

Reopen VS Code after installation. The commands below use Minikube's bundled kubectl, so a separate kubectl installation is unnecessary.

From the project root:

```powershell
minikube version
minikube start --driver=docker
minikube image build -t deep-utsav:1.0 .
minikube kubectl -- apply -f k8s/shop.yaml
minikube kubectl -- rollout status deployment/shop -n deep-utsav --timeout=180s
minikube kubectl -- get pods -n deep-utsav
```

The image is built inside Minikube. The manifest uses `imagePullPolicy: Never`, which means it expects this local image rather than a Docker Hub upload. Wait for the pod to become Running and Ready.

Open the service through a local port:

```powershell
minikube kubectl -- port-forward service/shop 8080:80 -n deep-utsav
```

Keep this terminal running and visit **http://localhost:8080**. Press Ctrl+C to stop forwarding.

| Kubernetes object | Meaning here |
| --- | --- |
| Namespace | Groups this shop's resources under `deep-utsav` |
| Deployment | Keeps one shop pod running and restarts failed pods |
| Pod | Runs the container made from your image |
| Service | Gives the pod a stable internal network address |
| PersistentVolumeClaim | Requests local storage for SQLite |
| Readiness/liveness probes | Check whether the server is ready and alive |
| Resource limits | Bound the CPU and memory the container can use |

The deployment intentionally uses **one replica** and the **Recreate** strategy because it has a local SQLite database. Do not scale this SQLite design across pods; use a shared production database before scaling. Minikube's default local storage provisioner is expected.

To rebuild after edits:

```powershell
minikube image build -t deep-utsav:1.0 .
minikube kubectl -- rollout restart deployment/shop -n deep-utsav
minikube kubectl -- rollout status deployment/shop -n deep-utsav
```

To inspect a failure:

```powershell
minikube kubectl -- get pods -n deep-utsav
minikube kubectl -- describe deployment shop -n deep-utsav
minikube kubectl -- logs deployment/shop -n deep-utsav
minikube kubectl -- get events -n deep-utsav --sort-by=.metadata.creationTimestamp
```

Stop the local cluster when finished:

```powershell
minikube stop
```

Starting it again preserves its local resources. `minikube delete` removes the cluster and its data; only use that if you deliberately want to discard the exercise. Docker Compose storage and Kubernetes storage are separate, so their demo order histories differ.

## Phase 7 — Explain it to a recruiter

After you have run and understood the project, explain it in your own words:

> I built a Diwali shopping demonstration with a React frontend and a Python Flask API. It supports filtering, searching, cart management and demo checkout. Python validates the order and calculates prices so browser changes cannot alter trusted prices. I packaged the frontend and backend into a multi-stage Docker image, ran it using Compose, and practised deployment to local Kubernetes. I used GitHub for version control.

Only add an online deployment or Kubernetes claim after you have actually completed that phase. Explain clearly that checkout is simulated and that production commerce needs payments, inventory and durable customer-order storage.

Practice explaining `useState`, `useEffect`, `fetch`, a Flask route, JSON, HTTP GET versus POST, a Docker image versus a container, and a Kubernetes Deployment versus a Service. Trace one product from `products.json` to the product card, then trace an order back to Python.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `docker` not recognised | Install Docker Desktop, then reopen VS Code |
| Cannot connect to Docker engine | Start Docker Desktop and wait for it to be ready; check `docker info` |
| WSL or virtualization error | Follow Docker's Windows requirements; enable hardware virtualization and update WSL |
| `no configuration file provided` | Open the folder containing `compose.yaml` |
| Port 8000 already allocated | Stop the other Python/container process; or change Compose mapping to `127.0.0.1:8001:8000` and open port 8001 |
| Changes do not appear in Docker | Save the file, stop the old run and use `docker compose up --build` |
| API error in local React mode | Keep the Python terminal running on 8000 and the React terminal on 5173 |
| `npm.ps1 cannot be loaded` | Use the supplied `npm.cmd` commands in PowerShell |
| `python` opens Microsoft Store | Install Python with PATH enabled, reopen VS Code, or try the `py` launcher |
| React opens but products fail | Visit `/api/health`; inspect the Python/container logs |
| Picture does not load | Check the image filename, extension and `/images/` path exactly |
| `remote origin already exists` | Inspect `git remote -v`; if it is the intended repository, skip adding it again |
| Git rejects a push to a nonempty repo | Use a new empty repo for this guide; do not force-push over existing work |
| Minikube pod says `ErrImageNeverPull` | Run `minikube image build -t deep-utsav:1.0 .` and verify the image name matches |
| Pod is Pending | Check events and available memory/storage; `minikube kubectl -- get pvc -n deep-utsav` shows storage status |
| Render initially looks asleep | Give the Free service time to wake; then check deployment logs if it still fails |
| Online orders disappear | Expected for this demo's SQLite file on Render Free; use durable storage for real orders |

## Official references

- Docker Windows installation: https://docs.docker.com/desktop/setup/install/windows-install/
- React: https://react.dev/
- Vite setup: https://vite.dev/guide/
- Flask production deployment: https://flask.palletsprojects.com/en/stable/deploying/
- GitHub repository creation: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- Render Docker hosting: https://render.com/docs/docker
- Render Free limits: https://render.com/docs/free
- Minikube installation: https://minikube.sigs.k8s.io/docs/start/
- Kubernetes introductory tutorial: https://kubernetes.io/docs/tutorials/hello-minikube/
