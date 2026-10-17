# Verification — 17 October 2026

## Passed in the creation environment

- Installed the React dependencies and generated `package-lock.json`.
- `npm run build`: Vite compiled the React application successfully.
- `python -m unittest -v`: all six backend tests passed.
- Tests cover catalogue responses, server-owned prices, delivery calculation, invalid IDs and quantities, duplicate product rejection, idempotent retry, malformed requests, health checks, and database persistence between app instances.
- Flask's test client served the built homepage and all four bundled images successfully.
- A path-traversal request was rejected.

## Not executed here

- Browser-based visual or interaction testing.
- Building/running the Docker image and Compose stack: no Docker engine was available.
- Applying the Kubernetes manifest: no Kubernetes/Minikube cluster was available.
- GitHub push or Render deployment: these require your account-specific setup.

Run the manual flow in Phase 1 and the deployment checks in Phases 5–6 before presenting those environments as tested. The website is a working source project with demo checkout, not a launched commercial store.
