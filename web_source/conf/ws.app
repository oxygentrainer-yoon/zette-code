server {
    listen 80;
    server_name _;

    # 静的フロント配信
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # WebSocket転送
    location /ws {
        proxy_pass http://127.0.0.1:3000;

        # WebSocketに必須
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";

        # 元のHost情報などを引き継ぐ
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 長時間接続向け
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}