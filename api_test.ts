import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";
import { AddCity, City, client, GetCities } from "./database.ts";

Deno.test("Insert into database", async () => {
    await client.queryObject<City>(
        "DELETE FROM city WHERE name='Test Montpellier'"
    );

    const inputCity = {
        department_code: "87654321",
        insee_code: "12345678",
        zip_code: "34000",
        name: "Test Montpellier",
        lat: "43.6",
        lon: "3.5",
    };

    AddCity(inputCity);

    const res = (
        await client.queryObject<City>(
            "SELECT * FROM city WHERE name='Test Montpellier'"
        )
    ).rows[0];

    delete res.id;

    assertEquals(res, inputCity);
});

// Deno.test("url test", () => {
//   client.query("SELECT * FROM city").then(res => {
//     assertEquals(res.rows.length, 1);
//     assertEquals(res.rows[0].name, "Paris");
//   }
// });

Deno.test("Health check api", () => {});
