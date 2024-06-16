const db = require("../db");
const { InlineKeyboard } = require("grammy");

async function createInlineKeyboard() {
  const groups = await db.query(`select * from groups`);
  const groupListInlineKeyboard = new InlineKeyboard();
  for (const button of groups.rows) {
    groupListInlineKeyboard.text(button.name, button.id.toString()).row();
  }
  return groupListInlineKeyboard;
}

module.exports = createInlineKeyboard;