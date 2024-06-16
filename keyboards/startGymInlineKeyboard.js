const { InlineKeyboard } = require("grammy");

const startGymInlineKeyboard = new InlineKeyboard()
  .text("Панель Админа", "/adminmenu")
  .text("Панель Пользователя", "/usermenu");

module.exports = startGymInlineKeyboard;