const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
// Accepts a data object, jsToSql obj
// creates a keys array of all the keys in the dataToUpdate object
// checks to make sure there is at least 1 key // aka data 
//creates a cols array of strings, maps each key passed in dataToUpdate to the cols array as a string like this "first_name"= $1, key = jsToSql[dataToUpdate[value] || value], $1 = $ + (idx + 1)
// returns an object with two keys 
// 1 setCols : "first_name = $1" + "dataToUpdate[key2] = $(idx1 + 1) aka $(idx2) aka $(2)"
// 2 values : (Object.values(dataToUpdate)) aka ["Aliya" aka Object.values(dataToUpdate)[idx0], 32 aka Object.values(dataToUpdate)[idx1]]

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
