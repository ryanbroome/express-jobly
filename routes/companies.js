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

console.log("=====\\!=====TOKEN VERIFY====/!======");
console.log("adminToken => jwt.verify", jwt.verify(adminToken, SECRET_KEY));
console.log("adminToken", adminToken);
console.log("regToken => jwt.verify", jwt.verify(regToken, SECRET_KEY));
console.log("regToken", regToken);
console.log("eddyToken", jwt.verify(eddyToken, SECRET_KEY));
// !rb enD
// ! DELETE BEFORE MOVING ON
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlUxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY5NTkxNDE4MX0.rxnNxiHyQshWogJkEVxkIdtEqx3rRMoZU7R39o3KIeU";
// ?END DELETE BEFORE MOVING ON

/** Routes for companies. */
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const { name, min, max } = req.query;
    let companies;

    if (name) {
      if (name && min && !max) {
        companies = await Company.getNameMin(name, min);
      } else if (name && !min && max) {
        companies = await Company.getNameMax(name, max);
      } else if (name && min && max) {
        companies = await Company.fullSort(name, min, max);
      } else {
        companies = await Company.getPartial(name);
      }
    } else if (min) {
      if (!name && max) {
        companies = await Company.range(min, max);
      }
      companies = await Company.getMinCompanies(min);
    } else if (max) {
      if (!name && !min && max) {
        companies = await Company.getMaxCompanies(max);
      }
    } else {
      companies = await Company.findAll();
    }
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    // const company = await Company.jobs2(req.params.handle);
    const company = await Company.get(req.params.handle);
    company.jobs = await Company.jobs(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

/** GET / abm/abm async creates a static token
 *
 * **/

// ?RB added start
// TEST FUNCTION TO PLAY
router.get("/abm/abm", async function (req, res, next) {
  try {
    const userToken = jwt.verify(regToken, SECRET_KEY);
    console.log("userToken", userToken);
    if (userToken.username !== "U1") {
      if (userToken.is_admin !== true) {
        console.log("userToken.is_admin == true");
      }
      res.json(`Hey you are username: ${userToken.username}`);
    }
    res.json("you made it, welcome admin");
  } catch (e) {
    return next(e);
  }
});

// ! RB added end

module.exports = router;
