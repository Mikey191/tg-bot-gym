const { InlineKeyboard } = require("grammy");
const AdminBotController = require("./adminBot.controller");
const db = require("../../database/db");

function convertDate(message_date) {
  const date = new Date(message_date * 1000);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

const exerciseEnd = new InlineKeyboard()
  .text("Повторить подход", "starttrainingexercise")
  .row()
  .text("Начать новое упражнение", "/starttraining")
  .row()
  .text("Закончить тренировку", "/usermenu");

function reseteSessionInitial(ctx) {
  ctx.session.waitingForResponseCreateGroup = null;
  ctx.session.waitingForResponseDeleteGroup = null;
  ctx.session.waitingForResponseCreateExercise = null;
  ctx.session.waitingForResponseDeleteExercise = null;
  ctx.session.waitingForResponseCreateWight = null;
  ctx.session.waitingForResponseCreateCountEx = null;
  ctx.session.groupExercise = null;
  ctx.session.groupForTraningExercise = null;
  ctx.session.exerciseForTraining = null;
  ctx.session.exerciseWight = null;
  ctx.session.exerciseCount = null;
}

class MsgController {
  constructor() {
    this.msgHandler = async (ctx) => {
      if (ctx.session.waitingForResponseCreateGroup) {
        // создание группы
        await AdminBotController.groups.createGroup.stepTwo(ctx);
      } else if (ctx.session.waitingForResponseCreateExercise) {
        //создание упражнения
        await AdminBotController.exercises.createExercise.stepThree(ctx);
      } else if (ctx.session.waitingForResponseCreateWight) {
        // создание веса в упражнении
        const weight = +ctx.message?.text;
        ctx.session.exerciseWight = weight;
        ctx.reply(`Введите количество повторений:`);
        ctx.session.waitingForResponseCreateCountEx = true;
        ctx.session.waitingForResponseCreateWight = false;
      } else if (ctx.session.waitingForResponseCreateCountEx) {
        // Список всех нужных переменных
        const telegram_id = ctx.message.from.id;
        const date = convertDate(ctx.message.date);
        const group_name = ctx.session.groupExercise;
        const exercises_name = ctx.session.exerciseForTraining;
        const count = +ctx.message.text;
        const weight = +ctx.session.exerciseWight;
        // Запись в БД
        await db.query(
          `insert into result_table (telegram_id, date, group_name, exercises_name, count, weight) values ($1,$2,$3,$4,$5,$6)`,
          [telegram_id, date, group_name, exercises_name, count, weight]
        );
        // Сообщение пользователю
        ctx.reply(
          `Данные записаны!\ntelegram_id - ${telegram_id}\ndate - ${date}\ngroup_name - ${group_name}\nexercises_name - ${exercises_name}\ncount - ${count}\nweight - ${weight}\nЧТО ДАЛЬШЕ?
          `,
          {
            reply_markup: exerciseEnd,
          }
        );
        // Обнуление сессии
        reseteSessionInitial(ctx);
        // оставить старые значения если пользователь захочет продолжить
        ctx.session.groupExercise = group_name;
        ctx.session.exerciseForTraining = exercises_name;
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    };
  }
}

module.exports = new MsgController();
