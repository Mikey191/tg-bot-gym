const adminMenuInlineKeyboard = require("../../keyboards/adminMenuInlineKeyboard");
const startGymInlineKeyboard = require("../../keyboards/startGymInlineKeyboard");

class MainMenu {
  constructor() {
    this.commands = {
      async start(ctx) {
        await ctx.reply(
          `Вас приветствует Бот для спортивного зала GymBot. С помощью меня вы можите создавать свои программы или воспользоваться уже созданными. Так же вы можите создавать свои группы мышц и упражнения для них. Для этого введите команду /startgym`
        );
      },
      async startgym(ctx){
        await ctx.reply(
          `Нажмите на ПАНЕЛЬ УПРАВЛЕНИЯ для открытия функций АДМИНИСТРАТОРА.\nНажмите на ПАНЕЛЬ ПОЛЬЗОВАТЕЛЯ для перехода в режим ПОЛЬЗОВАТЕЛЯ.
    `,
          {
            reply_markup: startGymInlineKeyboard,
          }
        );
      }
    };
    this.callbackQuerys = {
      async adminMenu(ctx){
        await ctx.answerCallbackQuery();
        await ctx.reply(
          `Вы вошли в режим админа.\nТут вы можете:\n- создавать свои "Группы Мыщц"\n- создавать свои "Упражнения для группы"\n- удалять уже существующие "Группы Мыщц"\n- удалять уже существующие "Упражнения для группы"`,
          {
            reply_markup: adminMenuInlineKeyboard,
          }
        );
      }
    }
  }
}

module.exports = new MainMenu();
