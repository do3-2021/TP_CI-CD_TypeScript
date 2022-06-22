import { initDB } from "./database.ts";
import { setupApp } from "./routes.ts";

const cityApiAddr = Deno.env.get("CITY_API_ADDR") || "0.0.0.0";
const cityApiPort = Deno.env.get("CITY_API_PORT") || "2022";

const dbClient = await initDB();
const app = setupApp(dbClient);

console.log("App listen on port " + cityApiPort);
await app.listen({ hostname: cityApiAddr, port: parseInt(cityApiPort) });
