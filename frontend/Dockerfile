FROM nginx:alpine

COPY index.html style.css app.js /usr/share/nginx/html/

COPY default.conf.template /etc/nginx/templates/

# Change nginx configuration to listen on port 8080
RUN sed -i 's/listen  80;/listen 8080;/g' /etc/nginx/conf.d/default.conf || true

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
