const { InlineKeyboard } = require("grammy");
const AdminBotController = require("./adminBot.controller");
const db = require("../../database/db");
const userBotController = require("./userBot.controller");
const statisticController = require("./statistic.controller");

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
        await statisticController.statisticUser.statisticDay.stepTwo(ctx);
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    };
  }
}

module.exports = new MsgController();
