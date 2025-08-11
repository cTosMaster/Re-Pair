# ---- build (Node) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # 결과물: /app/dist

# ---- run (Nginx) ----
FROM nginx:1.24-alpine
# SPA 라우팅/캐시용 서버 블록만 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]