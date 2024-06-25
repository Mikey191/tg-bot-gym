const db = require("../db");
const { InlineKeyboard } = require("grammy");
const callbacks = require("../utils/callbacks");

async function createExerciseListDelete(ctx) {
 console.log(`ctx.session.groupExercise function: `, ctx.session.groupExercise);
  const exercises = await db.query(
    `select name from exercises where namegroup = $1`,
    [ctx.session.groupExercise]
  );
  const exercisesListForDeleteInlineKeyboard = new InlineKeyboard();
  for (const button of exercises.rows) {
    exercisesListForDeleteInlineKeyboard
      .text(
        button.name.toString().trim(),
        callbacks.deleteExercise + button.name.toString().trim()
      )
      .row();
  }
  return exercisesListForDeleteInlineKeyboard;
}

module.exports = createExerciseListDelete;
