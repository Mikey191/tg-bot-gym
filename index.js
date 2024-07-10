require("dotenv").config();
const { session, InlineKeyboard } = require("grammy");
const AdminBotController = require("./bot/controller/adminBot.controller");
const MainMenu = require("./bot/controller/mainMenu.controller");
const bot = require("./bot/bot");
const botError = require("./bot/bot.error");
const initial = require("./bot/bot.initial.session");
const db = require("./database/db");
const MsgController = require("./bot/controller/msg.controller");
const UserBotController = require("./bot/controller/userBot.controller");
const statisticController = require("./bot/controller/statistic.controller");

// Открытие сессии с переменными флагами для создания групп и упражнений
bot.use(session({ initial }));
// Список команд бота
// bot.api.setMyCommands([
//   { command: "startgym", description: "Вызвать стартовую панель" },
// ]);

// команда старт
bot.command("start", MainMenu.commands.start);
// Открытие основного управления приложением
bot.command("startgym", MainMenu.commands.startgym);
// Основные возможности для Админа
bot.callbackQuery("/adminmenu", MainMenu.callbackQuerys.adminMenu);

// Обработчик сообщений для создания группы или упражнения
bot.on("msg", MsgController.msgHandler);

// Функции Админа для работы с группами - start
//Создание группы
bot.callbackQuery("/cgroup", AdminBotController.groups.createGroup.stepOne);
// Загрузить все данные из файла database/groupsAndExercises.js
bot.callbackQuery(
  "/loadge",
  AdminBotController.groups.loadGroupsAndExercises.stepOne
);
//Показать все группы
bot.callbackQuery(
  "/getgroups",
  AdminBotController.groups.showAllGroups.stepOne
);
//Удалить группу
bot.callbackQuery("/dgroup", AdminBotController.groups.deleteGroup.stepOne);
bot.callbackQuery(/deletegroup/, AdminBotController.groups.deleteGroup.stepTwo);
// Удалить все группы и все упражнения
bot.callbackQuery(
  "/dellge",
  AdminBotController.groups.deleteGroupsAndExercises.stepOne
);
// Функции Админа для работы с группами - end

// Функции Админа для работы с упражнениями - start
// Создание упражнения
bot.callbackQuery(
  "/cexer",
  AdminBotController.exercises.createExercise.stepOne
);
bot.callbackQuery(
  /createexercisegroup/,
  AdminBotController.exercises.createExercise.stepTwo
);
// Показать все упражнения определенной группы
bot.callbackQuery(
  "/getexer",
  AdminBotController.exercises.showAllExercises.stepOne
);
bot.callbackQuery(
  /getgroupexercises/,
  AdminBotController.exercises.showAllExercises.stepTwo
);
// Удаление упражнения из определенной группы
bot.callbackQuery(
  "/dexer",
  AdminBotController.exercises.deleteExercise.stepOne
);
bot.callbackQuery(
  /deleteexercisegroup/,
  AdminBotController.exercises.deleteExercise.stepTwo
);
bot.callbackQuery(
  /deleteexercise/,
  AdminBotController.exercises.deleteExercise.stepThree
);
// Функции Админа для работы с упражнениями - end

// Функции Пользователя для проведения тренировки - start
// Начать тренировку
bot.callbackQuery(
  "/usermenu",
  UserBotController.workout.workoutProcess.stepOne
);
// Выбрать группу мышц для тенировки
bot.callbackQuery(
  "/starttraining",
  UserBotController.workout.workoutProcess.stepTwo
);
// Выбрать упражнение из группы мыщц для тренировки
bot.callbackQuery(
  /stgroup/,
  UserBotController.workout.workoutProcess.stepThree
);
// Запрос на введение веса снаряда
bot.callbackQuery(
  /starttrainingexercise/,
  UserBotController.workout.workoutProcess.stepFour
);
// Переход в msg handler.
// Функции Пользователя для проведения тренировки - end

// Функции Для вывода статистики Пользователя из результирующей таблицы - start
bot.callbackQuery(
  "statistics",
  statisticController.statisticUser.statisticMenu.stepOne
);
// Статистика за сегодняшний день
bot.callbackQuery(
  "tstatistics",
  statisticController.statisticUser.statisticToday.stepOne
);
// Статистика за определенный день
bot.callbackQuery(
  "dstatistic",
  statisticController.statisticUser.statisticDay.stepOne
);

// Статистика за месяц
bot.callbackQuery("mstatistics", async (ctx) => {
  ctx.reply("Статистика подготавливается...");
  console.log(`Статистика за сегодняшнюю дату`);
});

// Статистика за период
bot.callbackQuery("rstatistics", async (ctx) => {
  ctx.reply("Статистика подготавливается...");
  ctx.reply(`Статистика за период`);
});

// Функции Для вывода статистики Пользователя из результирующей таблицы - end

// Обработчик ошибок
// bot.catch(BotError.errorHandler);
bot.catch(botError.errorHandler);
// Старт бота
bot.start();
