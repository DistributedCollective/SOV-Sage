build:
	docker build --tag sov-sage .
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
