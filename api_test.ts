import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";
import { AddCity, City, GetCities } from "./database.ts";

Deno.test("Insert into database", () => {
  AddCity(new Client(), {
});

Deno.test("url test", () => {
  client.query("SELECT * FROM city").then(res => {
    assertEquals(res.rows.length, 1);
    assertEquals(res.rows[0].name, "Paris");
  }
});
