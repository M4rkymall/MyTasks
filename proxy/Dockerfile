
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN printf '%s\n' '<html><body>MyTasks proxy OK</body></html>' > /usr/share/nginx/html/proxy-health.html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:80/proxy-health.html >/dev/null || exit 1
