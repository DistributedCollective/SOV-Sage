build:
	docker build -t sov-sage:latest .
	$(eval SHORT_COMMIT_HASH=$(shell git rev-parse --short HEAD))
	docker tag sov-sage:latest sov-sage:$(SHORT_COMMIT_HASH)
tar:
	docker save sov-sage:latest sov-sage.tar
run:
	docker run -d --rm --env-file .env --name sov-sage sov-sage
stop:
	docker stop sov-sage
logs:
	docker logs -f sov-sage
pm2:
	pm2-dev --node-args="-r esm" server.js
configMap:
	kubectl create configmap sov-sage-config --from-env-file=.env
loadImage:
	kind load image-archive sov-sage.tar --name app-1-cluster