// ?RB ADDED job
"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job already in database.
   * */
  // * REQUIRES TESTING TEST WITH INSOMNIA THEN WRITE TESTS FOR IT
  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title, company_handle
           FROM jobs
           WHERE company_handle = $1
           AND title ILIKE $2`,
      [company_handle, title]
    );

    if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate job at: ${company_handle} with title ${title}`);

    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{title, salary, equity, company_handle }, ...]
   * */
  // * REQUIRES TESTING TEST WITH INSOMNIA THEN WRITE TESTS FOR IT
  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        ORDER BY company_handle`
    );
    return jobsRes.rows;
  }

  /** Given a job ID, return data about job.
   *
   * Returns { title, salary, equity, company_handle}

   * Throws NotFoundError if not found.
   **/
  // * REQUIRES TESTING TEST WITH INSOMNIA THEN WRITE TESTS FOR IT
  static async get(id) {
    const jobRes = await db.query(
      `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with ID : ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */
  // * Done works, test for outliers.
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      /** company_handle : "companyHandle",
       * id : "ID" **/
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols}
                      WHERE id = ${idVarIdx} 
                      RETURNING
                                title, 
                                salary, 
                                equity,
                                company_handle`;

    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING title`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with ID: ${id}`);
  }

  // ? rb ADDED START Job filtering methods

  /** Given a searchTerm will return array of found jobjects with matching partial title - case insensitive, works or throws a NotFoundError if not found
   *
   * **/

  static async getPartial(searchTerm) {
    const results = await db.query(
      `SELECT 
            title, 
            salary, 
            equity, 
            company_handle
      FROM 
            jobs
      WHERE 
            title 
      ILIKE ($1)
      ORDER BY 
            title`,
      [`%${searchTerm}%`]
    );
    // if db returns something => jobs
    const jobs = results.rows;
    // if db returns nothing => error "msg", 400
    if (jobs.length === 0) {
      throw new NotFoundError(`No jobs found with title: ${searchTerm}`);
    }
    // returns array of found jobjects
    return jobs;
  }

  static async equity(jobs) {
    jobs = jobs.filter(function (row) {
      let equity = +row.equity;
      if (equity > 0) {
        console.log("row.equity", row.equity);
        return row.equity;
      }
    });

    if (jobs.length === 0) {
      throw new NotFoundError(`No jobs found with equity.`);
    }

    return jobs;
  }

  static async salary(jobs, salary) {
    jobs = jobs.filter(function (row) {
      return row.salary >= salary;
    });
    if (jobs.length === 0) {
      throw new NotFoundError(`No jobs found with equity.`);
    }
    return jobs;
  }

  static async filter(jobs, query) {
    const { title, minSalary, hasEquity } = query;
    console.log("title:", title, "minSalary:", minSalary, "hasEquity", hasEquity);
    // Possible testing issue with using this.?
    if (title) {
      jobs = await this.getPartial(title);
    } else if (!title) {
      jobs = await this.findAll();
    }
    // removed await from before Job below
    if (hasEquity != undefined) {
      jobs = await this.equity(jobs);
    }
    // removed await from before Job below
    if (minSalary) {
      jobs = await this.salary(jobs, minSalary);
    }
    return jobs;
  }
  // ! RB added end - Job filtering methods
}
module.exports = Job;
// !RB ADDED END - JOB
