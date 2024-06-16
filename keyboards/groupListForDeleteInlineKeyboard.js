const db = require("../db");
const { InlineKeyboard } = require("grammy");

async function createGroupListForDeleteInlineKeyboard() {
  const groups = await db.query(`select * from groups`);
  const groupListForDeleteInlineKeyboard = new InlineKeyboard();
  for (const button of groups.rows) {
    console.log(button.name.toString().trim());
    groupListForDeleteInlineKeyboard
      .text(button.name.toString().trim(), button.name.toString().trim())
      .row();
  }
  return groupListForDeleteInlineKeyboard;
}

module.exports = createGroupListForDeleteInlineKeyboard;
