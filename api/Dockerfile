# ベースイメージとしてNode.jsを使用
FROM node:20-alpine

# gitをインストール
RUN apk update && apk add --no-cache git

# 作業ディレクトリを設定
WORKDIR /api

# package.jsonをコピー
COPY ./package.json .

# 依存関係をインストール
# ※イメージにすでにyarnは入ってる
RUN yarn 

# 使用するポートを指定
EXPOSE 3000