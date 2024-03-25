"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */
  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */
  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/
  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */
  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/
  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }

  /** Given a searchTerm will return array of found company objects with matching partial name - case insensitive, works or throws a NotFoundError if not found
   *
   * **/
  static async getPartial(searchTerm) {
    const results = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        FROM companies
        WHERE name ILIKE ($1)
        ORDER BY name`,
      [`%${searchTerm}%`]
    );

    const nameCompanies = results.rows;

    if (nameCompanies.length === 0) {
      throw new NotFoundError(`No companies found with name: ${searchTerm}`);
    }

    return nameCompanies;
  }

  /** Given searchTerm & min sorts by partial name with min employees
   *
   **/
  static async getNameMin(searchTerm, min) {
    const results = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        FROM companies
        WHERE num_employees >= ($2)
        AND name ILIKE ($1)
        ORDER BY name`,
      [`%${searchTerm}%`, min]
    );

    const companies = results.rows;

    if (companies.length === 0) {
      throw new NotFoundError(`No companies found with name: ${searchTerm} and min employees ${min}`);
    }

    return companies;
  }

  /** Given searchTerm & max sorts by partial name with max employees
   *
   **/
  static async getNameMax(searchTerm, max) {
    const results = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        FROM companies
        WHERE num_employees <= ($2)
        AND name ILIKE ($1)
        ORDER BY name`,
      [`%${searchTerm}%`, max]
    );

    const companies = results.rows;

    if (companies.length === 0) {
      throw new NotFoundError(`No companies found with name: ${searchTerm} and min employees ${max}`);
    }

    return companies;
  }

  /** given a min number, returns companies with at least that many employees
   *
   *
   **/
  static async getMinCompanies(min) {
    const results = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
      FROM companies
      WHERE num_employees >= $1
      ORDER BY num_employees
  `,
      [min]
    );
    const minCompanies = results.rows;

    if (minCompanies.length === 0) {
      throw new NotFoundError(`No companies with minimum of ${min}employees`);
    }
    return minCompanies;
  }

  /** given a max, returns companies with max employees
   *
   **/
  static async getMaxCompanies(max) {
    const results = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
      FROM companies
      WHERE num_employees <= $1
      ORDER BY num_employees
  `,
      [max]
    );
    const maxCompanies = results.rows;

    if (maxCompanies.length === 0) {
      throw new NotFoundError(`No companies with maximum of ${max}employees`);
    }
    return maxCompanies;
  }

  /** given a min, max returns companies with range min-max employees
   *
   **/
  static async range(min, max) {
    const results = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
      FROM companies
      WHERE (num_employees >= $1 AND num_employees <= $2)
      ORDER BY num_employees
  `,
      [min, max]
    );
    const rangeCompanies = results.rows;

    if (rangeCompanies.length === 0) {
      throw new NotFoundError(`No companies with range ${min} - ${max}employees`);
    }
    return rangeCompanies;
  }

  /** given a min, max and name returns companies with range min-max employees containing searchTerm
   *
   **/
  static async fullSort(searchTerm, min, max) {
    const results = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
      FROM companies
      WHERE (num_employees >= $1 AND num_employees <= $2) 
      AND name ILIKE($3)
      ORDER BY num_employees
  `,
      [min, max, `%${searchTerm}%`]
    );
    const fullSortCompanies = results.rows;

    if (fullSortCompanies.length === 0) {
      throw new NotFoundError(`
      No companies found with (name = ${searchTerm}) having (${min} - ${max}) employees`);
    }
    return fullSortCompanies;
  }

  // ?ATTEMPT 1, and it works, just makes two queries, one against company db and a second against the jobs db this might be expensive and costly time wise

  /** given a company handle, return an array of jobs associated with that company_handle.
   *
   *=> jobs: [
    {id, title, salary, equity}, 
    {id2, title2, salary2, equity2}, ...
  ]
   **/
  static async jobs(handle) {
    const results = await db.query(
      `
SELECT 
      id,
      title,
      salary,
      equity
FROM 
      jobs
WHERE 
      company_handle = ($1)
`,
      [handle]
    );
    let companyJobs = results.rows;

    if (companyJobs.length === 0) {
      companyJobs = [];
      // throw new NotFoundError(`No jobs found for company ${handle}`);
    }

    return companyJobs;
  }
  // TODO correct this to try making one query to include jobs if their in db and not to include if their not, either way one query.
  // ?ATTEMPT 2, Company.jobs2(handle) NOT IN USE returning all companies with their corresponding jobs as an array of job_ids., MANY TO MANY join query, make one query for the company details {handle, name, description, numEmployees, logoUrl, jobs }, jobs =[{id, title, salary, equity}]
  static async jobs2(handle) {
    const results = await db.query(
      `
SELECT 
      c.handle, 
      c.name, 
      c.description, 
      c.num_employees AS "numEmployees", 
      c.logo_url AS "logoUrl",
      j.id,
      j.title,
      j.salary,
      j.equity
FROM 
      companies c
LEFT JOIN 
      jobs j
ON 
      c.handle = j.company_handle
WHERE 
      company_handle = ($1)
`,
      [handle]
    );
    if (results.rows.length === 0) {
      throw new NotFoundError(`No results with the handle : ${handle}`);
    }
    const company = {
      handle: results.rows[0].handle,
      name: results.rows[0].name,
      description: results.rows[0].description,
      numEmployees: results.rows[0].numEmployees,
      logoUrl: results.rows[0].logoUrl,
    };
    company.jobs = results.rows.map(function (r) {
      const job = {
        id: r.id,
        title: r.title,
        salary: r.salary,
        equity: r.equity,
      };
      return job;
    });
    return company;
  }
}

module.exports = Company;
