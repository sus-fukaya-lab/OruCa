# Makefile for OruCa Project

# .PHONYターゲットは、同名のファイルが存在する場合でもコマンドが実行されるようにします。
.PHONY: help init-dev init-prod up up-d build cache-clear attach-usb save-backup attach-backup

# --- 変数定義 ---
# ACCESSIBLE_HOST: Webアプリケーションにアクセスするためのホスト名またはIPアドレス
# Linux/WSL環境を想定し、'hostname -I' コマンドで最初に取得できるIPアドレスを試みます。
# 取得に失敗した場合や空の場合は 'localhost' をデフォルトとします。
# この値は、make実行時に ACCESSIBLE_HOST=your_ip_address のように上書き可能です。
# 例: make init-prod ACCESSIBLE_HOST=192.168.1.100
DETECTED_IP := $(shell hostname -I 2>/dev/null | awk '{print $$1}')
ACCESSIBLE_HOST ?= $(if $(strip $(DETECTED_IP)),$(DETECTED_IP),localhost)

# port: init-prod でwebサービスを公開する際のホスト側ポート (オプション)
port ?=

# backup_name: attach-backup で使用するバックアップのディレクトリ名 (例: YYYYMMDD-HHMMSS)
backup_name ?=

# --- ヘルプ表示 ---
help:
	@echo "OruCa Project Makefile"
	@echo ""
	@echo "Usage: make <target> [p=\"profile1 profile2\"] [t=service_name] [ACCESSIBLE_HOST=your.ip.address] [port=xxxx] [backup_name=YYYYMMDD-HHMMSS]"
	@echo ""
	@echo "Available targets:"
	@echo "  help                  Show this help message."
	@echo ""
	@echo "  ------------------ Project Initialization ------------------"
	@echo "  init-dev              Initializes the development environment."
	@echo "                        Starts vite dev server (http://$(ACCESSIBLE_HOST):4000) and other 'dev' services."
	@echo "  init-prod [port=xxxx] Builds frontend and starts all 'prod' services (web, api, etc.)."
	@echo "                        If 'port' is provided, web app is accessible at http://$(ACCESSIBLE_HOST):<port>."
	@echo "                        Otherwise, access via reverse proxy or other configured means."
	@echo ""
	@echo "  ------------------ General Docker Compose Commands ------------------"
	@echo "  up [p=<profiles>] [t=<services>]"
	@echo "                        Runs 'docker compose up --build' for specified profiles/services."
	@echo "                        Example: make up p=\"dev\" t=vite"
	@echo "  up-d [p=<profiles>] [t=<services>]"
	@echo "                        Runs 'docker compose up --build -d' (detached) for specified profiles/services."
	@echo "                        Example: make up-d p=\"dev\""
	@echo "  build [t=<service>]"
	@echo "                        Builds and starts a specific service in detached mode."
	@echo "                        Example: make build t=api"
	@echo ""
	@echo "  ------------------ Database Backup & Restore ------------------"
	@echo "  save-backup           Saves a backup of the MySQL database to mysql/backups/YYYYMMDD-HHMMSS/."
	@echo "  attach-backup backup_name=<name>"
	@echo "                        Restores the MySQL database from the specified backup (e.g., YYYYMMDD-HHMMSS)."
	@echo ""
	@echo "  ------------------ Utility Commands ------------------"
	@echo "  cache-clear           Prunes Docker builder cache."
	@echo "  attach-usb            (For WSL users) Attaches USB FeliCa reader to WSL."
	@echo ""
	@echo "Variables:"
	@echo "  p=\"profile1 profile2\" Space-separated list of Docker Compose profiles (e.g., \"dev\", \"prod\")."
	@echo "  t=<service_name>      Specific service name (e.g., \"vite\", \"web\", \"api\")."
	@echo "  ACCESSIBLE_HOST=<ip>  Hostname or IP to access the web application."
	@echo "  port=<port_number>    (For init-prod) Exposes the web service on the specified host port."
	@echo "  backup_name=<name>    (For attach-backup) Directory name of the backup to restore (e.g., YYYYMMDD-HHMMSS)."
	@echo ""

# --- Docker Compose Commands ---
# docker compose up --build (フォアグラウンド)
up:
	@echo "🚀 Bringing up services with profiles [$(p)] and specific services [$(t)] (foreground)..."
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build $(t)

# docker compose up --build -d (デタッチモード)
up-d:
	@echo "🚀 Bringing up services with profiles [$(p)] and specific services [$(t)] (detached)..."
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build -d $(t)

# 特定のサービスをビルドしてデタッチモードで起動
build:
	@echo "🛠️ Building and starting service [$(t)] in detached mode..."
	docker compose up -d --build $(t)

# --- Utility Commands ---
# Dockerビルドキャッシュのクリア
cache-clear:
	@echo "🧹 Clearing Docker builder cache..."
	docker builder prune -a
	@echo "✅ Docker builder cache cleared."

# USBデバイスのWSLへのアタッチ
attach-usb:
	@echo "🔌 Attempting to attach USB FeliCa reader to WSL..."
	@echo "   Please ensure you are running this from PowerShell on Windows if WSL is involved."
	./usb-wsl-attach.ps1
	@echo "✅ USB attach script executed. Check WSL for device."

# --- Project Initialization ---
# 開発環境の初期化: viteコンテナと関連サービスを起動
init-dev:
	@echo "🔄 Initializing OruCa Development Environment..."
	@echo "---------------------------------------------------------------------"
	@echo "➡️ STEP 1: Building Docker images for 'dev' profile services (if not already built)..."
	docker compose --profile dev build
	@echo "✅ Docker images for 'dev' profile checked/built."
	@echo "---------------------------------------------------------------------"
	@echo "➡️ STEP 2: Starting all 'dev' profile services (vite, api, mysql, nfc)..."
	$(MAKE) up-d p="dev"
	@echo "---------------------------------------------------------------------"
	@echo "🎉 OruCa Development Environment is ready!"
	@echo "   Vite dev server should be accessible at: http://$(ACCESSIBLE_HOST):4000"
	@echo "   Other services (api, mysql, nfc) are also up and running."
	@echo "---------------------------------------------------------------------"

# 本番環境の初期化: フロントエンドビルド -> webコンテナ含む本番環境サービス起動
init-prod:
	@echo "🔄 Initializing OruCa Production Environment: Full Build and Deploy"
	@echo "---------------------------------------------------------------------"
	@echo "➡️ STEP 1: Building Docker images for 'dev' (for vite build) & 'prod' profiles..."
	docker compose --profile dev --profile prod build
	@echo "✅ Docker images built."
	@echo "---------------------------------------------------------------------"
	@echo "➡️ STEP 2: Building frontend application in 'vite' container..."
	@echo "   Output will be in ./vite/dist/"
	mkdir -p ./vite/dist
	docker compose --profile dev run --rm vite yarn build
	@echo "✅ Frontend application built."
	@echo "---------------------------------------------------------------------"
	@echo "➡️ STEP 3: Starting all 'prod' profile services (web, api, mysql, nfc)..."
	$(if $(port), \
		@echo "   Publishing web service on port $(port)"; \
		# port引数が指定されている場合、docker-compose.override.yml を一時的に作成してポートマッピングを設定
		echo "services:" > docker-compose.override.yml; \
		echo "  web:" >> docker-compose.override.yml; \
		echo "    ports:" >> docker-compose.override.yml; \
		echo "      - \"$(port):80\"" >> docker-compose.override.yml; \
		# オーバーライドファイルを含めて本番プロファイルサービスを起動
		docker compose --profile prod -f docker-compose.yml -f docker-compose.override.yml up --build -d; \
		# 一時的なオーバーライドファイルを削除
		rm -f docker-compose.override.yml, \
		# port引数が指定されていない場合、ポートマッピングなしでサービスを起動
		@echo "   Web service port not specified, starting without explicit host port mapping (access via reverse proxy or other setup)."; \
		docker compose --profile prod up --build -d \
	)
	@echo "---------------------------------------------------------------------"
	@echo "🎉 OruCa Production Environment deployment complete!"
	$(if $(port), \
		@echo "   The OruCa web application should be accessible at: http://$(ACCESSIBLE_HOST):$(port)"; , \
		@echo "   The OruCa web application is running. Access it via your reverse proxy or configured setup."; \
	)
	@echo "   All production services (api, mysql, nfc, web) are up and running."
	@echo "   (If the displayed IP '$(ACCESSIBLE_HOST)' is not correct, specify it via 'make init-prod ACCESSIBLE_HOST=your.ip.address')"
	@echo "---------------------------------------------------------------------"

# --- Database Backup & Restore ---
TIMESTAMP := $(shell date +%Y%m%d-%H%M%S)
BACKUP_ROOT_DIR := mysql/backups
CURRENT_BACKUP_DIR := $(BACKUP_ROOT_DIR)/$(TIMESTAMP)

save-backup:
	@echo "💾 Saving database backup..."
	mkdir -p $(CURRENT_BACKUP_DIR)
	@echo "   Backup directory: $(CURRENT_BACKUP_DIR)"
	# MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE は .env ファイル経由でコンテナに設定されている前提
	docker compose exec -T mysql sh -c 'mysqldump --no-tablespaces -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE' > $(CURRENT_BACKUP_DIR)/backup.sql
	@echo "✅ Database backup saved to $(CURRENT_BACKUP_DIR)/backup.sql"

attach-backup:
	@if [ -z "$(backup_name)" ]; then \
		echo "❌ Error: backup_name argument is required. Example: make attach-backup backup_name=YYYYMMDD-HHMMSS"; \
		exit 1; \
	fi
	@BACKUP_FILE_PATH="$(BACKUP_ROOT_DIR)/$(backup_name)/backup.sql"; \
	if [ ! -f "$$BACKUP_FILE_PATH" ]; then \
		echo "❌ Error: Backup file $$BACKUP_FILE_PATH not found."; \
		exit 1; \
	fi
	@echo "🔄 Restoring database from $$BACKUP_FILE_PATH..."
	# MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE は .env ファイル経由でコンテナに設定されている前提
	cat $$BACKUP_FILE_PATH | docker compose exec -T mysql sh -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'
	@echo "✅ Database restored from $$BACKUP_FILE_PATH."

