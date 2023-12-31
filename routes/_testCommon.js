"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query(`DELETE FROM jobs`);
  // noinspection SqlWithoutWhere
  await db.query(`DELETE FROM applications`);

  Promise.all([
    await Company.create({
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    }),
    await Company.create({
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    }),
    await Company.create({
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    }),
    await User.register({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "user1@user.com",
      password: "password1",
      isAdmin: false,
    }),
    await User.register({
      username: "u2",
      firstName: "U2F",
      lastName: "U2L",
      email: "user2@user.com",
      password: "password2",
      isAdmin: false,
    }),
    await User.register({
      username: "u3",
      firstName: "U3F",
      lastName: "U3L",
      email: "user3@user.com",
      password: "password3",
      isAdmin: false,
    }),
    await User.register({
      username: "admin",
      firstName: "ad",
      lastName: "min",
      email: "admin@user.com",
      password: "password4",
      isAdmin: true,
    }),
    await Job.create({
      id: 1,
      title: "j1",
      salary: 1,
      equity: "0",
      company_handle: "c1",
    }),
    await Job.create({
      id: 2,
      title: "j2",
      salary: 2,
      equity: "0",
      company_handle: "c2",
    }),
  ]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  Promise.all([await db.query("ROLLBACK"), await db.query(`TRUNCATE jobs RESTART IDENTITY CASCADE`)]);
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const testToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluVXNlciIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY5Njk2MzI5OX0.jXSjBR_BLkIpeYzosNz-cmTKfvopMNynadatC3BPgGo`;

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  testToken,
};
