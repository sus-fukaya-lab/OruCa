# Node公式イメージ
FROM node:20-alpine

# 作業ディレクトリの指定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係インストール
RUN yarn install

# ソースコードをコピー
COPY . .

# Viteのデフォルトポートは5173だが、必要に応じて変更可能
EXPOSE 4000