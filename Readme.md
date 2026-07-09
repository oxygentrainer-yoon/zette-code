# Docker 起動・停止手順

## 前提

Docker Network が作成されていることを確認します。

```bash
docker network ls
```

存在しない場合は作成します。

```bash
docker network create tabacomyu-net
```

---

## Docker コンテナ起動

dockerディレクトリへ移動します。

```bash
cd ~/zetta-code/docker
```

### 1. PostgreSQL 起動

```bash
docker compose --env-file ../.env -f compose.db.yaml up -d
```

### 2. App（gateway-ws + filter-service）起動

```bash
docker compose --env-file ../.env -f compose.app.yaml up -d
```

### 3. Web（nginx）起動

```bash
docker compose --env-file ../.env -f compose.web.yaml up -d
```

---

## 起動確認

コンテナが起動していることを確認します。

```bash
docker ps
```

正常時は以下の3コンテナが表示されます。

```
tabacomyu-db
tabacomyu-app
tabacomyu-web
```

---

## ログ確認

### app

```bash
docker logs -f tabacomyu-app
```

### web

```bash
docker logs -f tabacomyu-web
```

### db

```bash
docker logs -f tabacomyu-db
```

---

## Docker コンテナ停止

起動とは逆順で停止します。

### 1. Web 停止

```bash
docker compose -f compose.web.yaml down
```

### 2. App 停止

```bash
docker compose -f compose.app.yaml down
```

### 3. DB 停止

```bash
docker compose -f compose.db.yaml down
```

---

## コンテナ状態確認

```bash
docker ps -a
```

起動中コンテナのみ確認する場合

```bash
docker ps
```

---

## イメージ再ビルド

Dockerfileを変更した場合はイメージを再ビルドします。

```bash
docker compose -f compose.app.yaml build --no-cache
```

その後、コンテナを起動します。

```bash
docker compose -f compose.app.yaml up -d
```

---

## Web画面確認

ローカル環境

```
http://localhost:8080
```

EC2環境（SSHポートフォワード利用）

```bash
ssh -i <秘密鍵.pem> -L 8080:localhost:8080 ec2-user@<EC2のPublic IP>
```

ブラウザからアクセスします。

```
http://localhost:8080
```
