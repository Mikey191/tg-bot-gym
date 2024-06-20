const { InlineKeyboard } = require("grammy");

const adminMenuInlineKeyboard = new InlineKeyboard()
  .text("Добавить группу", "/cgroup")
  .text("Добавить упражнение", "/cexer")
  .row()
  .text("Удалить группу", "/dgroup")
  .text("Удалить упражнение", "/dexer")
  .row()
  .text("Показать все группы", "/getgroups")
  .text("Показать упражнения", "/getexer");

module.exports = adminMenuInlineKeyboard;
