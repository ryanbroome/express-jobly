const { NotBeforeError } = require("jsonwebtoken");
const { NotFoundError } = require("./expressError");

let min = "minimum employees";
let max = "maximum employees";
let searchTerm = "search term partial company name -case insensitive";

// name = and
const getName = await db.query(
  `
SELECT handle,
name,
description,
num_employees AS "num_employees",
logo_url AS "logoUrl"
FROM companies
WHERE name ILIKE($1)
`,
  [searchTerm]
);
// min = 10
const getMin = await db.query(
  `
  SELECT handle,
  name,
  description,
  num_employees AS "num_employees",
  logo_url AS "logoUrl"
  FROM companies
  WHERE num_employees >= $1
  `,
  [min]
);
// max = 100
const getMax = await db.query(
  `
  SELECT handle,
  name,
  description,
  num_employees AS "num_employees",
  logo_url AS "logoUrl"
  FROM companies
  WHERE num_employees >= $1
  `,
  [max]
);
// name = and & min = 10
const getNameMin = await db.query(
  `
    SELECT handle,
    name,
    description,
    num_employees AS "num_employees",
    logo_url AS "logoUrl"
    FROM companies
    WHERE num_employees >= $1
    AND name ILIKE '%$2%'
`,
  // TODO TEST AND FIX ILIKE   %$2% '
  [min, searchTerm]
);
// name = and & max = 100
const getNameMax = await db.query(
  `
SELECT handle,
name,
description,
num_employees AS "num_employees",
logo_url AS "logoUrl"
FROM companies
WHERE num_employees <= $1
AND name ILIKE '%$2%'
`,
  [max, searchTerm]
);
// name = and & min=100 & max=200
const getFullSort = await db.query(
  `
  SELECT handle,
  name,
  description,
  num_employees AS "num_employees",
  logo_url AS "logoUrl"
  FROM companies
  WHERE num_employees >= $1 AND num_employees <= $2
  AND name ILIKE($3)
  `,
  [min, max, searchTerm]
);
// min = 10 & max = 100
const getMinMax = await db.query(
  `
SELECT handle,
name,
description,
num_employees AS "num_employees",
logo_url AS "logoUrl"
FROM companies
WHERE num_employees >= $1 AND num_employees <= $2
`,
  [min, max]
);

// TODO LEFTOFF HERE async function to replace middleware / auth / validateQueryParams
async function makeQueryString(req, res, next) {
  const { name, min, max } = req.query;
  const sq = `SELECT handle,
                            name,
                            description,
                            num_employees AS numEmployees,
                            logo_url AS logoUrl
                    FROM companies 
                    WHERE 
                    `;
  try {
    if (name) {
      if (name && min) {
        const q = sq + `num_employees >= ($1) AND name ILIKE '%$2%'`;
        const nameMinRes = await db.query(q, [min, name]);
        const nameMin = nameMinRes.rows;
        if (nameMin.length === 0) {
          throw new NotFoundError();
        }
        return res.json({ nameMin });
      } else if (name && max) {
        const q = sq + `num_employees <= ($1) AND name ILIKE '%$2%'`;
        const nameMaxRes = await db.query(q, [max, name]);
        const nameMax = nameMaxRes.rows;
        if (nameMax.length === 0) {
          throw new NotFoundError();
        }
        return res.json({ nameMax });
      } else if (name && min && max) {
        const q = sq + `num_employees >= ($1) AND num_employees <= ($2) AND name ILIKE '%$3%'`;
        const nameMinMaxRes = await db.query(q, [min, max, name]);
        const nameMinMax = nameMinMaxRes.rows;
        if (nameMinMax.length === 0) {
          throw new NotFoundError();
        }
        return res.json({ nameMinMax });
      } else {
        const q = sq + `name ILIKE ($1)`;
        const nameRes = await db.query(q, [name]);
        const names = nameRes.rows;
        if (names.length === 0) {
          throw new NotFoundError();
        }
        return res.json({ names });
      }
    }
  } catch (e) {
    return next(e);
  }
}

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
