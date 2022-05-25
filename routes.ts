import {
    Application,
    Context,
    Router,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.14.3/client.ts";
import { ParseBodyJSON, SendJSONResponse } from "./api.ts";
import { City, AddCity, GetCities } from "./database.ts";

export function setupRouter(dbClient: Client): Router {
    const router = new Router();

    router.post("/city", async (ctx: Context<Record<string, unknown>>) => {
        const body = await ParseBodyJSON<City>(ctx);

        AddCity(dbClient, body);

        return SendJSONResponse(ctx, { message: "Created" }, 201);
    });

    router.get("/city", async (ctx) => {
        return SendJSONResponse(ctx, await GetCities(dbClient), 200);
    });

    router.post("/_health", (ctx) => {
        ctx.response.status = 204;
    });

    return router;
}

export function setupApp(dbClient: Client) {
    const app = new Application();
    app.use(setupRouter(dbClient).routes());
    return app;
}
