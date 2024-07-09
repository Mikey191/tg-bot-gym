const { InlineKeyboard } = require("grammy");

const statisticMenuInlineKeyboard = new InlineKeyboard()
  .text("Статистика сегодня", "tstatistics")
  .row()
  .text("Статистика за определенный день", "dstatistic")
  .row()
  .text("Статистика за месяц", "mstatistics")
  .row()
  .text("Статистика за период", "rstatistics");

 module.exports = statisticMenuInlineKeyboard;