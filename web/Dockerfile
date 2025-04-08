# nginx公式イメージ
FROM nginx:latest

# NginxのHTML配信ディレクトリにdistをコピー
COPY dist /usr/share/nginx/html

# 必要に応じてカスタムnginx設定ファイルもコピー
# 例: reverse proxy や SPA対応
# COPY nginx.conf /etc/nginx/nginx.conf

# デフォルトのポート
EXPOSE 8080
