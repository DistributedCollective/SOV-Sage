build:
	docker build --tag sov-sage .
run:
	docker run -d --rm --env-file .env --name sov-sage sov-sage
stop:
	docker stop sov-sage
logs:
	docker logs -f sov-sage