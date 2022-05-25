FROM denoland/deno:1.22.0

EXPOSE 2022

WORKDIR /app

USER deno

ADD . .

RUN deno cache index.ts

CMD ["run", "--allow-all", "index.ts"]