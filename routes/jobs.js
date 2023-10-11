"use strict";
// ?rb add
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { authenticateJWT } = require("../middleware/auth");
const { createToken } = require("../helpers/tokens");

const adminUser = { username: "adminUser", password: "password", firstName: "first", lastName: "last", email: "test@gmail.com", isAdmin: true };
const regUser = { username: "regUser", password: "password", firstName: "first", lastName: "last", email: "test@gmail.com", isAdmin: false };

const adminToken = createToken(adminUser);
const regToken = createToken(regUser);
const eddyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVkZHltdW5zdGEiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjk2MjU4NzI0fQ.g1hc8iY_Njv-yrBeMCB1kCWb2GvJKZ7ZyX3ET8UssX0";

// !rb enD
// ! DELETE BEFORE MOVING ON
// const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlUxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY5NTkxNDE4MX0.rxnNxiHyQshWogJkEVxkIdtEqx3rRMoZU7R39o3KIeU";
// ?END DELETE BEFORE MOVING ON
// TODO left off here working on routes, models done but need testing need routes to do so.
/** Routes for jobs. */
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 *? CHECK Authorization required: login?
 */
// * DONE, requires testing
router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  ALL =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters: [title, hasEquity, minSalary ]
 *
 * Authorization required: none
 */
// *DONE, add testing and change auth
router.get("/", async function (req, res, next) {
  try {
    let jobs;
    if (req.query) {
      jobs = await Job.filter(jobs, req.query);
    }
    if (!req.query) {
      jobs = await Job.findAll();
    }
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *s
 *  Job is { title, salary, equity, company_handle }
 *
 * !Authorization required:
 */
// * DONE, add testing and change auth
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *todo check what is returned below when updating a job in db using this route and Job.updateMethod
 *todo Returns { id, title, salary, equity, company_handle }
 *
 *! Authorization required: login
 */
// *DONE, add testing
router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */
// * DONE, add testing
router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

// todo DELETE BEFORE submitting
// /** GET / abm/abm async creates a static token
//  *
//  * **/
// // TODO delete before submission this router.get("abm/abm")
// // ?RB added start
// // TEST FUNCTION TO PLAY
// router.get("/abm/abm", async function (req, res, next) {
//   try {
//     const userToken = jwt.verify(regToken, SECRET_KEY);
//     console.log("userToken", userToken);
//     if (userToken.username !== "U1") {
//       if (userToken.is_admin !== true) {
//         console.log("userToken.is_admin == true");
//       }
//       res.json(`Hey you are username: ${userToken.username}`);
//     }
//     res.json("you made it, welcome admin");
//   } catch (e) {
//     return next(e);
//   }
// });
// todo end
// ! RB added end

module.exports = router;
