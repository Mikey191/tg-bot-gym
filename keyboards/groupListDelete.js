const db = require("../db");
const { InlineKeyboard } = require("grammy");
const callbacks = require("../utils/callbacks");

async function createGroupListInlineKeyboard() {
  const groups = await db.query(`select * from groups`);
  const groupListForDeleteInlineKeyboard = new InlineKeyboard();
  for (const button of groups.rows) {
    groupListForDeleteInlineKeyboard
      .text(
        button.name.toString().trim(),
        callbacks.deleteGroup + button.name.toString().trim()
      )
      .row();
  }
  return groupListForDeleteInlineKeyboard;
}

module.exports = createGroupListInlineKeyboard;
