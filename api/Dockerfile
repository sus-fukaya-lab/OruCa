# ベースイメージとしてNode.jsを使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package.json yarn.lock ./

# 依存関係をインストール
RUN yarn install

# アプリのコードをコンテナにコピー
COPY . .

# 使用するポートを指定
EXPOSE 3000

# コンテナ起動時のコマンド
CMD ["yarn", "start"]
