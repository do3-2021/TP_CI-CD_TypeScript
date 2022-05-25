import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { AddCity, City, client } from "./database.ts";
import { setupApp } from "./routes.ts";
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import {
    assertSpyCall,
    assertSpyCalls,
    returnsNext,
    stub,
} from "https://deno.land/std@0.140.0/testing/mock.ts";

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

Deno.test("Check get cities", () => {
    const app = setupApp();

    const getCitiesStub = stub(client, "queryObject", );
});

Deno.test("Health check api", async () => {
    const app = setupApp();

    const request = await superoak(app);

    await request.post("/_health").expect(204);
});
