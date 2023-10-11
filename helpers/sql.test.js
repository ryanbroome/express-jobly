// TESTS  sqlForPartialUpdate, written by RB - Top to Bottom
const { sqlForPartialUpdate } = require("./sql.js");
const db = require("../db");

describe("tests sqlForPartialUpdate", function () {
  // Declare variables  for testing
  let userDataToUpdate;
  let jsToSql;
  let badDataToUpdate;
  let badJsToSql;
  let noDataToUpdate;

  beforeEach(async function () {
    // Define variables for testing
    userDataToUpdate = { firstName: "John", lastName: "Smith" };
    badDataToUpdate = { firstName: undefined, lastName: undefined };
    // noDataToUpdate = {};

    jsToSql = { firstName: "first_name", lastName: "last_name" };
    // badJsToSql = { firstName: "", lastName: "" };
  });
  afterAll(async function () {
    await db.end();
  });

  test("works - data present: sqlForPartialUpdate", async function () {
    const { setCols, values } = sqlForPartialUpdate(userDataToUpdate, jsToSql);
    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual(["John", "Smith"]);
  });

  test("fails - missing value data: sqlForPartialUpdate", async function () {
    const { setCols, values } = sqlForPartialUpdate(badDataToUpdate, jsToSql);
    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual([undefined, undefined]);
  });

  //   test("fails - jsToSql: sqlForPartialUpdate", async function () {
  //      ?Mentor - How would i write a test for no data. Can not seem to figure out how to say expect this to throw an error.
  //      ? Mentor - My first approach at this testing was to call the API routes that use sqlForPartialUpdate, but i got confused trying to make that work. I tried using hardcoded user data, then create a token then make the request but I could not get the token to work due to await not working.
  //      const { setCols, values } = sqlForPartialUpdate(noDataToUpdate, jsToSql);
  //     const response = sqlForPartialUpdate(noDataToUpdate, jsToSql);
  //   expect(response).toBe(expect.any(ErrorEvent));
  //   });
});
