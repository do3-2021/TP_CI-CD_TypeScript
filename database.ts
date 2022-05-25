import { Client } from "https://deno.land/x/postgres@v0.14.3/mod.ts";

export interface City {
    id?: string;
    department_code: string;
    insee_code: string;
    zip_code: string;
    name: string;
    lat: string;
    lon: string;
}

export function AddCity(client: Client, city: City): Promise<unknown> {
    return client.queryArray(
        "INSERT INTO city (department_code, insee_code, zip_code, name, lat, lon) VALUES ($1, $2, $3, $4, $5, $6)",
        city.department_code,
        city.insee_code,
        city.zip_code,
        city.name,
        city.lat,
        city.lon
    );
}

export async function GetCities(client: Client): Promise<City[]> {
    const output = await client.queryObject<City[] | City>(
        "SELECT * FROM city"
    );

    let cities: Array<City> = [];

    if (Array.isArray(output)) cities = output;
    else cities = [output as unknown as City];
    return cities;
}

export async function initDB() {
    const hostname = Deno.env.get("CITY_API_DB_URL") || "localhost";
    const port = parseInt(Deno.env.get("CITY_API_DB_PORT") ?? "") || "5432";
    const username = Deno.env.get("CITY_API_DB_USER") || "postgres";
    const password = Deno.env.get("CITY_API_DB_PWD") || "postgres";
    const database = Deno.env.get("CITY_API_DB_DATABASE") || "postgres";
    const client = new Client({
        database: database,
        user: username,
        password: password,
        hostname: hostname,
        port: port,
    });
    await client.connect();

    const text = await Deno.readTextFile("init.sql");

    await client.queryArray(text);
    return client;
}
