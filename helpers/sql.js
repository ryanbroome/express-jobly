const { BadRequestError } = require("../expressError");

/** Returns Set Columns portion of SQL query string and parameterized values
 * takes two objects, data to update and the js variable names as keys with SQL column names as values
 * ( { dataToUpdate } , { jsToSql } )
 * =>
 *  SET COLUMNS and PARAMETERIZED values
 * { setCols : ` "first_name" : = $1 `, values : [ "John" ] }
 *
 * { { firstName : "John", age : 18 } , jsToSql: { firstName : "first_name", age : "age" } }
 * =>
 * {  setCols: ` "first_name" = $1 , "age" = $2 `, values : [ "John", 18 ]  }
 *
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
