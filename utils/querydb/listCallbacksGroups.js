const db = require("../../db");

//Список групп колбэков (колбэк - ключи объекта)
async function getListCallbacksGroups() {
  const groups = await db.query(`select * from groups`);
  const listCallback = groups.rows.map((group) => `${group.name}`);
  return listCallback;
}

module.exports = getListCallbacksGroups;
