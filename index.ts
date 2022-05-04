import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { ParseBodyJSON, SendJSONResponse } from "./api.ts";
import { AddCity, City, GetCities } from "./database.ts";

const cityApiAddr = Deno.env.get("CITY_API_ADDR") || "127.0.0.1";
const cityApiPort = Deno.env.get("CITY_API_PORT") || "2022";

const app = new Application();

const router = new Router();

router.post("/city", async (ctx) => {
    const body = await ParseBodyJSON<City>(ctx);

    AddCity(body);

    return SendJSONResponse(ctx, { message: "Created" }, 201);
});

router.get("/city", async (ctx) => {
    return SendJSONResponse(ctx, await GetCities(), 200);
});

router.post("/_health", (ctx) => {
    ctx.response.status = 204;
});

await app.listen({ hostname: cityApiAddr, port: parseInt(cityApiPort) });
