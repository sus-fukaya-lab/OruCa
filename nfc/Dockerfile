FROM python:3.13-alpine
# 必要なライブラリ（libusb）をインストール
RUN apk update && apk add --no-cache libusb-dev

# 環境変数の設定（UTF-8対応）
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	LANG=C.UTF-8 \
	TZ=Asia/Tokyo
# 必要に応じて pip のバージョンを更新
RUN pip install --upgrade pip

# 作業ディレクトリを作成
WORKDIR /app

# ホスト側のファイルをコピー（必要であれば）
COPY . /app

# 依存関係をインストール（必要なら requirements.txt を置いてください）
RUN pip install -r requirements.txt