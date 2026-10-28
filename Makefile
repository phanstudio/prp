.PHONY: build up down install typecheck lint shell logs ps r-build

build:
	docker compose up --build

up:
	docker compose up

down:
	docker compose down

install:
	docker compose run --rm react-app npm install

typecheck:
	docker compose run --rm react-app npm run typecheck

lint:
	docker compose run --rm react-app npm run lint

shell:
	docker compose run --rm react-app sh

logs:
	docker compose logs -f react-app

ps:
	docker compose ps

test:
	docker compose run --rm react-app npm test

r-build:
	docker compose exec react-app npm run build

