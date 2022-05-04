import { Application, Context } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
/**
 * Sends a JSON-formatted response to a request.
 *
 * @param ctx Request context
 * @param response Response object
 * @param code the http code to send
 */
export const SendJSONResponse = <T>(
    ctx: Context<Record<string, unknown>>,
    response: T,
    code = 200
): void => {
    if (ctx.response.writable) {
        // Set content type to application/json and stringify the response object
        ctx.response.headers.append("Content-Type", "application/json");
        ctx.response.body = JSON.stringify(response);
        ctx.response.status = code;
    }
};

export const Prefix = "/api/v1";

/**
 * Parse the body from the JSON request
 */
export function ParseBodyJSON<T>(ctx: Context<Record<string, unknown>>): Promise<T> {
    return ctx.request.body({ type: "json" }).value.catch((err) => {
        console.log("err :", err);
        SendJSONResponse(ctx, { message: "Invalid JSON/body" }, 400);
    });
}

export type ApplicationState = Application<{
    pool: Pool;
}>;
