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

## Debugging

Inspect prod logs:

```sh
docker exec -it protofun-service-protofun-service-1 sh
ls -l logs
less logs/
# docker cp protofun-service-protofun-service-1:/usr/src/app/logs .
```
