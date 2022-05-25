import {
    Application,
    Context,
    Router,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { ParseBodyJSON, SendJSONResponse } from "./api.ts";
import { City, AddCity, GetCities } from "./database.ts";

export function setupRouter(): Router {
    const router = new Router();

    router.post("/city", async (ctx: Context<Record<string, unknown>>) => {
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

    return router;
}

export function setupApp() {
    const app = new Application();
    app.use(setupRouter().routes());
    return app;
}
