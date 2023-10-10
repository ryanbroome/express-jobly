// Removed from jobUpdate.json
// ,
        // "company_handle": {
        //     "type": "string",
        //     "default": "",
        //     "title": "The company_handle Schema",
        //     "examples": [
        //         "ABM"
        //     ]
        // }
        ,
        // "company_handle": "ABM"
// const { NotBeforeError } = require("jsonwebtoken");
// const { NotFoundError } = require("./expressError");

// let min = "minimum employees";
// let max = "maximum employees";
// let searchTerm = "search term partial company name -case insensitive";

// // name = and
// const getName = await db.query(
//   `
// SELECT handle,
// name,
// description,
// num_employees AS "num_employees",
// logo_url AS "logoUrl"
// FROM companies
// WHERE name ILIKE($1)
// `,
//   [searchTerm]
// );
// // min = 10
// const getMin = await db.query(
//   `
//   SELECT handle,
//   name,
//   description,
//   num_employees AS "num_employees",
//   logo_url AS "logoUrl"
//   FROM companies
//   WHERE num_employees >= $1
//   `,
//   [min]
// );
// // max = 100
// const getMax = await db.query(
//   `
//   SELECT handle,
//   name,
//   description,
//   num_employees AS "num_employees",
//   logo_url AS "logoUrl"
//   FROM companies
//   WHERE num_employees >= $1
//   `,
//   [max]
// );
// // name = and & min = 10
// const getNameMin = await db.query(
//   `
//     SELECT handle,
//     name,
//     description,
//     num_employees AS "num_employees",
//     logo_url AS "logoUrl"
//     FROM companies
//     WHERE num_employees >= $1
//     AND name ILIKE '%$2%'
// `,
//   // TODO TEST AND FIX ILIKE   %$2% '
//   [min, searchTerm]
// );
// // name = and & max = 100
// const getNameMax = await db.query(
//   `
// SELECT handle,
// name,
// description,
// num_employees AS "num_employees",
// logo_url AS "logoUrl"
// FROM companies
// WHERE num_employees <= $1
// AND name ILIKE '%$2%'
// `,
//   [max, searchTerm]
// );
// // name = and & min=100 & max=200
// const getFullSort = await db.query(
//   `
//   SELECT handle,
//   name,
//   description,
//   num_employees AS "num_employees",
//   logo_url AS "logoUrl"
//   FROM companies
//   WHERE num_employees >= $1 AND num_employees <= $2
//   AND name ILIKE($3)
//   `,
//   [min, max, searchTerm]
// );
// // min = 10 & max = 100
// const getMinMax = await db.query(
//   `
// SELECT handle,
// name,
// description,
// num_employees AS "num_employees",
// logo_url AS "logoUrl"
// FROM companies
// WHERE num_employees >= $1 AND num_employees <= $2
// `,
//   [min, max]
// );

// // TODO LEFTOFF HERE async function to replace middleware / auth / validateQueryParams
// async function makeQueryString(req, res, next) {
//   const { name, min, max } = req.query;
//   const sq = `SELECT handle,
//                             name,
//                             description,
//                             num_employees AS numEmployees,
//                             logo_url AS logoUrl
//                     FROM companies 
//                     WHERE 
//                     `;
//   try {
//     if (name) {
//       if (name && min) {
//         const q = sq + `num_employees >= ($1) AND name ILIKE '%$2%'`;
//         const nameMinRes = await db.query(q, [min, name]);
//         const nameMin = nameMinRes.rows;
//         if (nameMin.length === 0) {
//           throw new NotFoundError();
//         }
//         return res.json({ nameMin });
//       } else if (name && max) {
//         const q = sq + `num_employees <= ($1) AND name ILIKE '%$2%'`;
//         const nameMaxRes = await db.query(q, [max, name]);
//         const nameMax = nameMaxRes.rows;
//         if (nameMax.length === 0) {
//           throw new NotFoundError();
//         }
//         return res.json({ nameMax });
//       } else if (name && min && max) {
//         const q = sq + `num_employees >= ($1) AND num_employees <= ($2) AND name ILIKE '%$3%'`;
//         const nameMinMaxRes = await db.query(q, [min, max, name]);
//         const nameMinMax = nameMinMaxRes.rows;
//         if (nameMinMax.length === 0) {
//           throw new NotFoundError();
//         }
//         return res.json({ nameMinMax });
//       } else {
//         const q = sq + `name ILIKE ($1)`;
//         const nameRes = await db.query(q, [name]);
//         const names = nameRes.rows;
//         if (names.length === 0) {
//           throw new NotFoundError();
//         }
//         return res.json({ names });
//       }
//     }
//   } catch (e) {
//     return next(e);
//   }
// }

// // ? RB Start
// static async makeQueryString(req, res, next) {
//     const { name, min, max } = req.query;
//     const sq = `SELECT handle,
//                             name,
//                             description,
//                             num_employees AS numEmployees,
//                             logo_url AS logoUrl
//                     FROM companies
//                     WHERE
//                     `;
//     try {
//       if (name) {
//         if (name && min) {
//           const q = sq + `num_employees >= ($1) AND name ILIKE '%$2%'`;
//           const nameMinRes = await db.query(q, [min, name]);
//           const nameMin = nameMinRes.rows;
//           if (nameMin.length === 0) {
//             throw new NotFoundError();
//           }
//           return res.json({ nameMin });
//         } else if (name && max) {
//           const q = sq + `num_employees <= ($1) AND name ILIKE '%$2%'`;
//           const nameMaxRes = await db.query(q, [max, name]);
//           const nameMax = nameMaxRes.rows;
//           if (nameMax.length === 0) {
//             throw new NotFoundError();
//           }
//           return res.json({ nameMax });
//         } else if (name && min && max) {
//           const q = sq + `num_employees >= ($1) AND num_employees <= ($2) AND name ILIKE '%$3%'`;
//           const nameMinMaxRes = await db.query(q, [min, max, name]);
//           const nameMinMax = nameMinMaxRes.rows;
//           if (nameMinMax.length === 0) {
//             throw new NotFoundError();
//           }
//           return res.json({ nameMinMax });
//         } else {
//           const q = sq + `name ILIKE ($1)`;
//           const nameRes = await db.query(q, [name]);
//           const names = nameRes.rows;
//           if (names.length === 0) {
//             throw new NotFoundError();
//           }
//           return res.json({ names });
//         }
//       }
//     } catch (e) {
//       return next(e);
//     }
//   }

//   // ! rb END

// // DELETE BEFORE SUBMISSION RB removed methods when transferring filter methods from companies to jobs. These are trash unless needed for reference or copy paste


  // /** given a min number, returns companies with at least that many employees
  //  *
  //  *
  //  **/
  // static async getMinCompanies(min) {
  //   const results = await db.query(
  //     `SELECT handle,
  //             name,
  //             description,
  //             num_employees AS "numEmployees",
  //             logo_url AS "logoUrl"
  //     FROM companies
  //     WHERE num_employees >= $1
  //     ORDER BY num_employees
  // `,
  //     [min]
  //   );
  //   const minCompanies = results.rows;

  //   if (minCompanies.length === 0) {
  //     throw new NotFoundError(`No companies with minimum of ${min}employees`);
  //   }
  //   return minCompanies;
  // }
  // /** given a max, returns companies with max employees
  //  *
  //  **/
  // static async getMaxCompanies(max) {
  //   const results = await db.query(
  //     `SELECT handle,
  //             name,
  //             description,
  //             num_employees AS "numEmployees",
  //             logo_url AS "logoUrl"
  //     FROM companies
  //     WHERE num_employees <= $1
  //     ORDER BY num_employees
  // `,
  //     [max]
  //   );
  //   const maxCompanies = results.rows;

  //   if (maxCompanies.length === 0) {
  //     throw new NotFoundError(`No companies with maximum of ${max}employees`);
  //   }
  //   return maxCompanies;
  // }
  // /** given a min, max returns companies with range min-max employees
  //  *
  //  **/
  // static async range(min, max) {
  //   const results = await db.query(
  //     `SELECT handle,
  //             name,
  //             description,
  //             num_employees AS "numEmployees",
  //             logo_url AS "logoUrl"
  //     FROM companies
  //     WHERE (num_employees >= $1 AND num_employees <= $2)
  //     ORDER BY num_employees
  // `,
  //     [min, max]
  //   );
  //   const rangeCompanies = results.rows;

  //   if (rangeCompanies.length === 0) {
  //     throw new NotFoundError(`No companies with range ${min} - ${max}employees`);
  //   }
  //   return rangeCompanies;
  // }
  // /** given a min, max and name returns companies with range min-max employees containing searchTerm
  //  *
  //  **/
  // static async fullSort(searchTerm, min, max) {
  //   const results = await db.query(
  //     `SELECT handle,
  //             name,
  //             description,
  //             num_employees AS "numEmployees",
  //             logo_url AS "logoUrl"
  //     FROM companies
  //     WHERE (num_employees >= $1 AND num_employees <= $2)
  //     AND name ILIKE($3)
  //     ORDER BY num_employees
  // `,
  //     [min, max, `%${searchTerm}%`]
  //   );
  //   const fullSortCompanies = results.rows;

  //   if (fullSortCompanies.length === 0) {
  //     throw new NotFoundError(`
  //     No companies found with (name = ${searchTerm}) having (${min} - ${max}) employees`);
  //   }
  //   return fullSortCompanies;
  // //

}
// From models / job.js replaced with jobs.filter()
//   // Given a min number returns array of jobjects with that min salary

  // static async getMinSalary(min) {
  //   const results = await db.query(
  //     `SELECT 
  //             title, 
  //             salary, 
  //             equity, 
  //             company_handle
  //       FROM 
  //             jobs
  //       WHERE 
  //             salary >= ($1)
  //       ORDER BY 
  //             salary`,
  //     [min]
  //   );
  //   // if db returns something
  //   const jobs = results.rows;
  //   // if db returns nothing => error "none found", 400
  //   if (jobs.length === 0) {
  //     throw new NotFoundError(`No jobs found with minimum salary amount of : ${min}`);
  //   }
  //   // returns array of found jobs
  //   return jobs;
  // }

  // // /** Returns all jobjects that have equity or reference equity in listing

  // static async hasEquity() {
  //   const results = await db.query(
  //     `SELECT
  //         title,
  //         salary,
  //         equity,
  //         company_handle 
  //     FROM 
  //           jobs 
  //     WHERE 
  //         equity 
  //     IS NOT NULL 
  //     ORDER BY 
  //         equity;`
  //   );
  //   // if db returns something => jobs
  //   const jobs = results.rows;
  //   // if db returns nothing => error "none found", 400
  //   if (jobs.length === 0) {
  //     throw new NotFoundError(`No jobs found with equity.`);
  //   }
  //   // returns array of found jobjects
  //   return jobs;
  // }

  // ?Removed from POST /routes/ users/ :username / jobs / :jobId
      // TODO create schema? or validate data?
    // const validator = jsonschema.validate(req.body, userNewSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map((e) => e.stack);
    //   throw new BadRequestError(errs);
    // }
    // const user = await User.register(req.body);
    // const token = createToken(user);