"use strict";
// todo write test file
const request = require("supertest");

const db = require("../db");
const app = require("../app");

const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testToken } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newJob",
    salary: 1,
    equity: "0",
    company_handle: "c1",
    id: expect.any(Number),
  };
  const partialJob = {
    title: "newJob",
    company_handle: "c1",
  };
  const badDataJob = {
    hours: "8a-4p",
  };

  const testToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluVXNlciIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY5Njk2MzI5OX0.jXSjBR_BLkIpeYzosNz-cmTKfvopMNynadatC3BPgGo`;

  test("ok for users", async function () {
    const resp = await request(app).post("/jobs").send(newJob).set("authorization", testToken);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app).post("/jobs").send(partialJob).set("authorization", testToken);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...badDataJob,
      })
      .set("authorization", testToken);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for a-non", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "j1",
          salary: 1,
          equity: "0",
          company_handle: "c1",
          id: expect.any(Number),
        },
        {
          title: "j2",
          salary: 2,
          equity: "0",
          company_handle: "c2",
          id: expect.any(Number),
        },
      ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app).get("/jobs").set("authorization", testToken);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        title: "j1",
        salary: 1,
        equity: "0",
        company_handle: "c1",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: expect.any(Array),
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/99`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "J1-new",
      })
      .set("authorization", testToken);

    expect(resp.body).toEqual({
      job: {
        title: "J1-new",
        salary: 1,
        equity: "0",
        company_handle: "c1",
      },
    });
  });
  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/1`).send({
      name: "J1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });
  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/jobs/9999`)
      .send({
        title: "new nope",
      })
      .set("authorization", testToken);
    expect(resp.statusCode).toEqual(404);
  });
  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 1,
      })
      .set("authorization", testToken);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for users", async function () {
    const resp = await request(app).delete(`/jobs/1`).set("authorization", testToken);
    expect(resp.body).toEqual({ deleted: "1" });
  });
  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });
  test("not found for no such company", async function () {
    const resp = await request(app).delete(`/jobs/9999`).set("authorization", testToken);
    expect(resp.statusCode).toEqual(404);
  });
});
