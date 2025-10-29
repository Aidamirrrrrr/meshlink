FROM node:22.17.0-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_SIGNALING_URL
ARG VITE_API_BASE_URL

ENV VITE_SIGNALING_URL=${VITE_SIGNALING_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build


FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
