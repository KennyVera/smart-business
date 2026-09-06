FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5173

# El volumen anónimo de node_modules puede quedar desfasado si package.json
# cambia. Se sincroniza al arrancar para no perder dependencias nuevas.
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
