FROM mcr.microsoft.com/playwright:v1.61.0-noble

RUN npm install -g playwright@1.61.0

EXPOSE 3000

CMD ["playwright", "run-server", "--port", "3000", "--host", "0.0.0.0"]
