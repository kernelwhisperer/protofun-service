# Contributing

## Deployment

After commit & push:

1. Bump

  ```sh
  yarn version
  ```

2. Update the server

  ```sh
  git pull
  cp .env.example .env
  touch config/.production
  npm run build && docker compose up -d
  ```
