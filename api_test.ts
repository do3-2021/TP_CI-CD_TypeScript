import { setupApp } from "./routes.ts";
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import {
  assertSpyCall,
  spy,
} from "https://deno.land/std@0.140.0/testing/mock.ts";
import { Client } from "https://deno.land/x/postgres@v0.14.3/client.ts";
import { City, initDB } from "./database.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.144.0/testing/asserts.ts";

Deno.test("Integration : insert into database", async () => {
  const inputCity = {
    department_code: "87654321",
    insee_code: "12345678",
    zip_code: "34000",
    name: "Test Montpellier",
    lat: "43.6",
    lon: "3.5",
  };

  const dbClient = await initDB();
  const app = setupApp(dbClient);

  dbClient.queryArray("DELETE FROM city");

  const simulated = await superoak(app);

  await simulated.post("/city").send(inputCity).expect(201);

  const cities = await dbClient.queryObject("SELECT * FROM city");

  assert(cities.rowCount || 0 >= 1);
  let found = false;

  (cities.rows as City[]).forEach((city: City) => {
    if (
      city.name === inputCity.name &&
      city.department_code === inputCity.department_code &&
      city.insee_code === inputCity.insee_code &&
      city.zip_code === inputCity.zip_code &&
      city.lat === inputCity.lat &&
      city.lon === inputCity.lon
    )
      found = true;
  });

  assert(found);

  dbClient.end();
});

Deno.test("Integration : get cities from database", async () => {
  const dbClient = await initDB();
  const app = setupApp(dbClient);

  dbClient.queryArray("DELETE FROM city");

  const sampleCities: City[] = [
    {
      department_code: "87654321",
      insee_code: "12345678",
      zip_code: "34000",
      name: "Test Montpellier",
      lat: "43.6",
      lon: "3.5",
    },
    {
      department_code: "87654322",
      insee_code: "12345679",
      zip_code: "34001",
      name: "Test Paris",
      lat: "48.6",
      lon: "2.5",
    },
  ];

  await Promise.all(
    sampleCities.map((city: City) =>
      dbClient.queryArray(
        "INSERT INTO city (department_code, insee_code, zip_code, name, lat, lon) VALUES ($1, $2, $3, $4, $5, $6)",
        city.department_code,
        city.insee_code,
        city.zip_code,
        city.name,
        city.lat,
        city.lon
      )
    )
  );

  const simulated = await superoak(app);

  const json = (await simulated.get("/city").expect(200)).body as City[];

  let found = 0;

  sampleCities.forEach((city: City) => {
    console.log(city);
    if (
      json.find((c: City) => {
        console.log("aaaa", c);
        return (
          c.name === city.name &&
          c.department_code === city.department_code &&
          c.insee_code === city.insee_code &&
          c.zip_code === city.zip_code &&
          c.lat === city.lat &&
          c.lon === city.lon
        );
      })
    )
      found++;
  });

  assertEquals(found, sampleCities.length);

  dbClient.end();
});

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
    return Promise.resolve({ rows: result });
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

  await request.get("/_health").expect(204);
});
