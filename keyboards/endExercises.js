const { InlineKeyboard } = require("grammy");

const endExercises = new InlineKeyboard()
  .text("Повторить подход", "starttrainingexercise")
  .row()
  .text("Начать новое упражнение", "/starttraining")
  .row()
  .text("Закончить тренировку", "/usermenu");

module.exports = endExercises;