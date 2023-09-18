# Contributing

## Deployment

After commit & push:

1. Bump

  ```sh
  yarn version
  git add . && git commit -m "Add new bundle" && git push
  ```

2. Update the server

  ```sh
  cd repos/protofun-service && git pull
  # cp .env.example .env
  npm run build && docker compose up -d
  ```
