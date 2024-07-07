const { InlineKeyboard } = require("grammy");

const userStartTrainInlineKeyboard = new InlineKeyboard()
  .text("Начать тренировку", "/starttraining")
  .row()
  .text("Моя статистика", "statistics");

module.exports = userStartTrainInlineKeyboard;