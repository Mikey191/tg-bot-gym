const { InlineKeyboard } = require("grammy");
const AdminBotController = require("./adminBot.controller");
const db = require("../../database/db");
const userBotController = require("./userBot.controller");

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
        // создание веса снаряда в упражнении
        await userBotController.workout.workoutProcess.stepFive(ctx);
      } else if (ctx.session.waitingForResponseCreateCountEx) {
        // Создание повторений упражнения и запись в базу данных
        await userBotController.workout.workoutProcess.stepSix(ctx);
      } else if (ctx.session.waitingForResponseCreateDate) {
        // создание даты для вывода статистики за этот день
        const date = ctx.message.text;
        console.log("Дата: ", date);
        const telegram_id = ctx.message.from.id;
        console.log("telegram_id = ", telegram_id);
        // console.log(date.getDate(), date.getMonth() + 1, date.getFullYear());
        // Запрос к БД с определенной датой
        const res = await db.query(
          `select * from result_table where date = $1 and telegram_id = $2`,
          [date, telegram_id]
        );
        // console.log(res.rows);
        let result = "";
        res.rows.forEach((item) => {
          result += `Группа мышц: ${item.group_name};\n`;
          result += `Упражнение: ${item.exercises_name}\n`;
          result += `Количество повторений: ${item.count}\n`;
          result += `Вес снаряда: ${item.weight}\n`;
          result += `\n`;
        });
        console.log(result);
        ctx.reply(`${result}`);
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    };
  }
}

module.exports = new MsgController();
