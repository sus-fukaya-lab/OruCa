# Node公式イメージ
FROM node:20-alpine

# 作業ディレクトリの指定
WORKDIR /vite

# package.jsonをコピー
COPY ./package.json .

# 依存関係をインストール
# ※イメージにすでにyarnは入ってる
RUN yarn

# Viteのデフォルトポートは5173だが、必要に応じて変更可能
EXPOSE 4000