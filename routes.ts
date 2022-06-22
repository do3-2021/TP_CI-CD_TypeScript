import {
    Application,
    Context,
    Router,
} from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.14.3/client.ts";
import { ParseBodyJSON, SendJSONResponse } from "./api.ts";
import { City, AddCity, GetCities } from "./database.ts";
import {
    Counter,
    Registry,
} from "https://deno.land/x/ts_prometheus@v0.3.0/mod.ts";

const counter = Counter.with({
    name: "http_requests_total",
    help: "The total HTTP requests",
    labels: ["path", "method", "status"],
});

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

    router.get("/_health", (ctx) => {
        ctx.response.status = 204;
    });

    router.get("/metrics", (ctx) => {
        ctx.response.body = Registry.default.metrics();
    });

    return router;
}

export function setupApp(dbClient: Client) {
    const app = new Application();

    // update counters

    app.use(async (ctx, next) => {
        await next();
        counter
            .labels({
                path: ctx.request.url.pathname,
                method: ctx.request.method,
                status: ctx.response.status.toString() || "",
            })
            .inc();
    });

    // use routes

    app.use(setupRouter(dbClient).routes());
    return app;
}
