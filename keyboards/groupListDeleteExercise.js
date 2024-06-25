const db = require("../db");
const { InlineKeyboard } = require("grammy");
const callbacks = require("../utils/callbacks");

async function createGroupListDeleteExercise() {
  const groups = await db.query(`select * from groups`);
  const groupListForDeleteInlineKeyboard = new InlineKeyboard();
  for (const button of groups.rows) {
    groupListForDeleteInlineKeyboard
      .text(
        button.name.toString().trim(),
        callbacks.deleteExerciseGroup + button.name.toString().trim()
      )
      .row();
  }
  return groupListForDeleteInlineKeyboard;
}

module.exports = createGroupListDeleteExercise;
