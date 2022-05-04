import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { ParseBodyJSON, SendJSONResponse } from "./api.ts";

const hostname = Deno.env.get("CITY_API_DB_URL") || "localhost";
const port = parseInt(Deno.env.get("CITY_API_DB_PORT") ?? "") || "5432";
const username = Deno.env.get("CITY_API_DB_USER") || "postgres";
const password = Deno.env.get("CITY_API_DB_PWD") || "postgres";
const database = Deno.env.get("CITY_API_DB_DATABASE") || "postgres";

const cityApiAddr = Deno.env.get("CITY_API_ADDR") || "127.0.0.1";
const cityApiPort = Deno.env.get("CITY_API_PORT") || "2022";

const client = new Client({
    database: database,
    user: username,
    password: password,
    hostname: hostname,
    port: port,
});
await client.connect();

const app = new Application();

const router = new Router();

interface City {
    id?: string;
    department_code: string;
    insee_code: string;
    zip_code: string;
    name: string;
    lat: number;
    lon: number;
}

router.post("/city", async (ctx) => {
    const body = await ParseBodyJSON<City>(ctx);

    // insert

    return SendJSONResponse(ctx, { message: "Created" }, 201);
});

router.get("/city",async (ctx) => {
    // request

    let cities = await client.queryObject<City[] | City>("SELECT * FROM city");

    


    return SendJSONResponse(ctx, cities, 200);
});

router.post("/_health", (ctx) => {
    ctx.response.status = 204;
});

await app.listen({ hostname: cityApiAddr, port: parseInt(cityApiPort) });
