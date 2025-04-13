<<<<<<< HEAD
run-docker:
	@source ./server/.env && \
		sudo docker run --rm \
		gdg-email-service:latest \
		-p ${PORT}  \
		
=======
run-docker:
	@source ./server/.env && \
		sudo docker run --rm \
		gdg-email-service:latest \
		-p ${PORT}  \
		
run-server:
	@cd server && \
		sudo docker run \ 
		-p 8998:8998 \ 
		-e PORT=8998 \ 
		-e API_VER="/api/v1" \
		-e JWT_SECRET="demo_secret" \
		-e DATABASE_URL="" \
		-e ROOT_EMAIL=${ROOT_EMAIL} \
		-e ROOT_PASSWORD=${ROOT_PASSWORD} \
		-e GCP_PROJECT_ID=${GCP_PROJECT_ID} \
		devpiush/gdg-leaderboard-server:latest
>>>>>>> 1bcc234c578f82fb7578181fb457d74e32a5fe49
