.PHONY: up up-d build cache-clear 

# profile引数p: 例）make up p="dev prod"
# service引数s: 例）make build t=api

up:
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build $(t)

up-d:
	docker compose $(foreach prof,$(p),--profile $(prof)) up --build -d $(t)

build:
	docker compose up -d --build $(t)

cache-clear:
	docker builder prune -a