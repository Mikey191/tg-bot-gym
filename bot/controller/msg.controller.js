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
        // Запрос к БД с определенной датой. Список всех упражнений в эту дату
        const res = await db.query(
          `select * from result_table where date = $1 and telegram_id = $2`,
          [date, telegram_id]
        );
        // Результирующая строка, которую будет видеть пользователь
        let result = "";
        // Создание сета из упражнений
        let exercisesSet = new Set();
        const dayAllExercise = res.rows;
        dayAllExercise.forEach((item) => {
          exercisesSet.add(item.exercises_name);
        });
        // Создание списка из сета потому что его легче использовать
        const exercisesList = [...exercisesSet];
        console.log(exercisesList);
        // Проходим циклом по списку упражнений
        for (let i = 0; i < exercisesList.length; i++) {
          // Проверка на пустоту
          if (exercisesList[i]) {
            result += `Упражнение ${exercisesList[i]}:\n`;
            // Проходим циклом и ищем упражнения в БД
            // Счетчик для подсчета упражнений
            let countExercise = 0;
            for (let j = 0; j < dayAllExercise.length; j++) {
              if (exercisesList[i] === dayAllExercise[j].exercises_name) {
                countExercise++;
                result += `\t\t\t${countExercise} подход: ${dayAllExercise[i].count} повторений по ${dayAllExercise[i].weight}\n`;
              }
            }
          }
        }
        console.log(result);
        ctx.reply(`${result}`);
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    };
  }
}

module.exports = new MsgController();
