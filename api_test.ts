import { setupApp } from "./routes.ts";
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import {
    assertSpyCall,
    spy,
} from "https://deno.land/std@0.140.0/testing/mock.ts";
import { Client } from "https://deno.land/x/postgres@v0.14.3/client.ts";

Deno.test("Insert into database", async () => {
    const inputCity = {
        department_code: "87654321",
        insee_code: "12345678",
        zip_code: "34000",
        name: "Test Montpellier",
        lat: "43.6",
        lon: "3.5",
    };
    const queryArray = (_query: string, ..._args: unknown[]) => {
        return true;
    };

    const querySpy = spy(queryArray);

    const fakeClient = {
        queryArray: querySpy,
    } as unknown as Client;

    const app = setupApp(fakeClient);

    const request = await superoak(app);

    await request.post("/city").send(JSON.stringify(inputCity)).expect(201);
    assertSpyCall(querySpy, 0, {
        args: [
            "INSERT INTO city (department_code, insee_code, zip_code, name, lat, lon) VALUES ($1, $2, $3, $4, $5, $6)",
            inputCity.department_code,
            inputCity.insee_code,
            inputCity.zip_code,
            inputCity.name,
            inputCity.lat,
            inputCity.lon,
        ],
    });
});

Deno.test("Check get cities", async () => {
    const result = [
        {
            id: 1,
            department_code: "01",
            insee_code: "01001",
            zip_code: "01400",
            name: "L'Abergement-Clémenciat",
            lat: 46.15678199203189,
            lon: 4.92469920318725,
        },
    ];
    const queryObject = (_query: string) => {
        return Promise.resolve(result);
    };

    const querySpy = spy(queryObject);

    const fakeClient = {
        queryObject: querySpy,
    };

    const app = setupApp(fakeClient as unknown as Client);

    const request = await superoak(app);

    await request.get("/city").expect(200).expect(JSON.stringify(result));

    // assertSpyCall(querySpy, 0, {
    //     args: ["SELECT * FROM city"],
    // });
});

Deno.test("Health check api", async () => {
    const app = setupApp(undefined as unknown as Client);

    const request = await superoak(app);

    await request.post("/_health").expect(204);
});
