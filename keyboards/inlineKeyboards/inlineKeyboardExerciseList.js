const { InlineKeyboard } = require("grammy");
const db = require("../../database/db");

class InlineKeyboardExerciseList {
  constructor() {
    this.callbacks = {
      deleteExercise: "deleteexercise",
      startTrainingExercise: "starttrainingexercise",
    };

    async function createExerciseList(ctx, callback) {
      // console.log(ctx.callbackQuery);
      const exercises = await db.query(
        `select name from exercises where namegroup = $1`,
        [ctx.session.groupExercise]
      );
      const exerciseListInlineKeyboard = new InlineKeyboard();
      for (const button of exercises.rows) {
        exerciseListInlineKeyboard
          .text(
            button.name.toString().trim(),
            (callback + button.name.toString().trim()).slice(0, 40)
          )
          .row();
      }
      return exerciseListInlineKeyboard;
    }
    // клавиатура списка упражнений для удаления упражнения
    this.inlineKeyboardExerciseForDeleteExercise = async function (ctx) {
      return createExerciseList(ctx, this.callbacks.deleteExercise);
    };
    // Клавиатура списка упражнений для старта тренировки
    this.inlineKeyboardExerciseForStartTraining = async function (ctx) {
      return createExerciseList(ctx, this.callbacks.startTrainingExercise);
    };
  }
}

module.exports = new InlineKeyboardExerciseList();
