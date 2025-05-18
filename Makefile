# Makefile

# .PHONYターゲットは、同名のファイルが存在する場合でもコマンドが実行されるようにします。
.PHONY: help init up up-d build cache-clear attach-usb

# --- 変数定義 ---
# ACCESSIBLE_HOST: Webアプリケーションにアクセスするためのホスト名またはIPアドレス
#
# Linux/WSL環境を想定し、'hostname -I' コマンドで最初に取得できるIPアドレスを試みます。
# 取得に失敗した場合や空の場合は 'localhost' をデフォルトとします。
# この値は、make実行時に ACCESSIBLE_HOST=your_ip_address のように上書き可能です。
# 例: make init ACCESSIBLE_HOST=192.168.1.100
#
# 注意: hostname -I の出力や、どのIPが外部アクセスに適切かは環境に依存します。
# awk '{print $$1}' の $$1 は、makeの変数展開を避けるために $ をエスケープしています。
DETECTED_IP := $(shell hostname -I 2>/dev/null | awk '{print $$1}')
ACCESSIBLE_HOST ?= $(if $(strip $(DETECTED_IP)),$(DETECTED_IP),localhost)

# --- ヘルプ表示 ---
help:
	@echo "OruCa Project Makefile"
	@echo ""
	@echo "Usage: make <target> [p=\"profile1 profile2\"] [t=service_name] [ACCESSIBLE_HOST=your.ip.address]"
	@echo ""
	@echo "Available targets:"
	@echo "  help                 Show this help message."
	@echo ""
	@echo "  ------------------ Main Project Initialization ------------------"
	@echo "  init                 Builds all images, builds frontend, and starts all 'prod' services (web, api, etc.)."
	@echo "                       Access web application using the IP displayed at the end (defaults to http://$(ACCESSIBLE_HOST):4040)."
	@echo ""
	@echo "  ------------------ General Docker Compose Commands ------------------"
	@echo "  up [p=<profiles>] [t=<services>]"
	@echo "                       Runs 'docker compose up --build' for specified profiles and services."
	@echo "                       Example: make up p=\"dev\" t=vite"
	@echo "                       Example: make up p=\"prod\""
	@echo ""
	@echo "  up-d [p=<profiles>] [t=<services>]"
	@echo "                       Runs 'docker compose up --build -d' (detached) for specified profiles and services."
	@echo "                       Example: make up-d p=\"dev\""
	@echo "                       Example: make up-d p=\"prod\" t=web"
	@echo ""
	@echo "  build [t=<service>]  (Note: This is 'up -d --build' for a single service)"
	@echo "                       Builds and starts a specific service in detached mode."
	@echo "                       Example: make build t=api"
	@echo ""
	@echo "  ------------------ Utility Commands ------------------"
	@echo "  cache-clear          Prunes Docker builder cache."
	@echo "  attach-usb           (For WSL users) Attaches USB FeliCa reader to WSL."
	@echo ""
	@echo "Variables:"
	@echo "  p=\"profile1 profile2\"  Space-separated list of Docker Compose profiles (e.g., \"dev\", \"prod\", \"dev prod\")."
	@echo "  t=<service_name>       Specific service name (e.g., \"vite\", \"web\", \"api\")."
	@echo "  ACCESSIBLE_HOST=<ip_or_hostname>"
	@echo "                       Hostname or IP to access the web application (used in informational messages)."
	@echo "                       Defaults to auto-detected IP or 'localhost'."
	@echo ""

# profile引数p: 例）make up p="dev prod"
# service引数s: 例）make up t=api (特定のサービスのみを指定する場合。空の場合はプロファイル内の全サービス)

# docker compose up --build (フォアグラウンド)
up:
	@echo "🚀 Bringing up services with profiles [$(p)] and specific services [$(t)] (foreground)..."
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build $(t)

# docker compose up --build -d (デタッチモード)
up-d:
	@echo "🚀 Bringing up services with profiles [$(p)] and specific services [$(t)] (detached)..."
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build -d $(t)

# 特定のサービスをビルドしてデタッチモードで起動 (既存のbuildターゲットの挙動)
# 例: make build t=api
build:
	@echo "🛠️ Building and starting service [$(t)] in detached mode..."
	docker compose up -d --build $(t)

# Dockerビルドキャッシュのクリア
cache-clear:
	@echo "🧹 Clearing Docker builder cache..."
	docker builder prune -a
	@echo "✅ Docker builder cache cleared."

# USBデバイスのWSLへのアタッチ (RC-S380/P FeliCaリーダー用)
# このコマンドはWindows PowerShellで実行されることを想定しています。
attach-usb:
	@echo "🔌 Attempting to attach USB FeliCa reader to WSL..."
	@echo "   Please ensure you are running this from PowerShell on Windows if WSL is involved."
	./usb-wsl-attach.ps1
	@echo "✅ USB attach script executed. Check WSL for device."

# --- メインの初期化ターゲット (旧 init-prod-deploy) ---
# Dockerイメージビルド -> viteコンテナでのフロントエンドビルド -> webコンテナ含む本番環境サービス起動
init:
	@echo "🔄 Initializing OruCa Production Environment: Full Build and Deploy"
	@echo "---------------------------------------------------------------------"

	@echo "➡️ STEP 1: Building Docker images for all services (dev & prod profiles)..."
	# 'dev'プロファイルの'vite'サービスイメージと、'prod'プロファイルの'web'サービスイメージ、
	# 及びそれらが依存する共通サービス(api, mysql, nfc)のイメージをビルドします。
	docker compose --profile dev build
	@echo "✅ Docker images built."
	@echo "---------------------------------------------------------------------"

	@echo "➡️ STEP 2: Building frontend application in 'vite' container..."
	@echo "   Output will be in ./vite/dist/"
	# ホストに ./vite/dist ディレクトリが存在することを確認 (通常はyarn buildが作成)
	mkdir -p ./vite/dist
	# 'dev'プロファイルの'vite'コンテナを一時的に使用してフロントエンドをビルド
	docker compose --profile dev run --rm vite yarn build
	@echo "✅ Frontend application built."
	@echo "---------------------------------------------------------------------"

	@echo "➡️ STEP 3: Starting all 'prod' profile services (web, api, mysql, nfc)..."
	@echo "   This will stop/remove existing 'prod' containers and start new ones."
	# 既存の `up-d` ターゲットを `prod` プロファイルで呼び出し、全サービスを起動
	# `up-d` 内の `--build` フラグにより、必要に応じてサービスイメージも再ビルドされます。
	# `web`サービスは新しい `./vite/dist` の内容をマウントして起動します。
	$(MAKE) up-d p="prod" t="web"
	@echo "---------------------------------------------------------------------"
	@echo "🎉 OruCa Production Environment deployment complete!"
	# ACCESSIBLE_HOST 変数を使用
	@echo "   The OruCa web application should be accessible at: http://$(ACCESSIBLE_HOST):4040"
	@echo "   All production services (api, mysql, nfc, web) are up and running."
	@echo "   (If the displayed IP '$(ACCESSIBLE_HOST)' is not correct for your setup, you can specify it via 'make init ACCESSIBLE_HOST=your.ip.address')"
	@echo "---------------------------------------------------------------------"