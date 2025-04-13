run-docker:
	@source ./server/.env && \
		sudo docker run --rm \
		gdg-email-service:latest \
		-p ${PORT}  \
		
