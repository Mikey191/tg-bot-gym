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
bot.callbackQuery("/usermenu", UserBotController.workout.workoutProcess.stepOne);
// Выбрать группу мышц для тенировки
bot.callbackQuery("/starttraining", UserBotController.workout.workoutProcess.stepTwo);
// Выбрать упражнение из группы мыщц для тренировки
bot.callbackQuery(/stgroup/, UserBotController.workout.workoutProcess.stepThree);
// Запрос на введение веса снаряда
bot.callbackQuery(/starttrainingexercise/, UserBotController.workout.workoutProcess.stepFour);
// Переход в msg handler.
// Функции Пользователя для проведения тренировки - end

// Функции Для вывода статистики Пользователя из результирующей таблицы - start
// Клавиатура для уточняющей статистики
const inlineKeyboardStatistics = new InlineKeyboard()
  .text("Статистика сегодня", "tstatistics")
  .row()
  .text("Статистика за определенный день", "dstatistic")
  .row()
  .text("Статистика за месяц", "mstatistics")
  .row()
  .text("Статистика за период", "rstatistics");
// Функция для конвертации даты
function convertDate(message_date) {
  const date = new Date(message_date * 1000);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

bot.callbackQuery("statistics", async (ctx) => {
  ctx.reply(`Ваша статистика подгатавливается...`, {
    reply_markup: inlineKeyboardStatistics,
  });
});
// Статистика за сегодняшний день
bot.callbackQuery("tstatistics", async (ctx) => {
  console.log("Статистика сегодня");
  // Дата Сегодня
  const date = convertDate(ctx.callbackQuery.message.date);
  // id пользователя
  const telegram_id = ctx.from.id;
  // Запрос к БД что бы вытащить все строки с упражнениями
  const res = await db.query(
    `select * from result_table where date = $1 and telegram_id = $2`,
    [date, telegram_id]
  );
  // Сформировать список(можно не список) с уникальными упражнениями
  console.log(res.rows[0]);
});
// Статистика за определенный день
bot.callbackQuery("dstatistic", async (ctx) => {
  console.log(`Статистика за определенную дату`);
  ctx.reply(
    `Статистика за определенный день.\nВведите Дату в формате дд.мм.гггг:`
  );
  ctx.session.waitingForResponseCreateDate = true;
});

// Статистика за месяц
bot.callbackQuery("mstatistics", async (ctx) => {
  ctx.reply("Ваша Статистика за месяц.");
});

// Статистика за период
bot.callbackQuery("rstatistics", async (ctx) => {
  ctx.reply(`Статистика за период`);
});

// Функции Для вывода статистики Пользователя из результирующей таблицы - end

// Обработчик ошибок
// bot.catch(BotError.errorHandler);
bot.catch(botError.errorHandler);
// Старт бота
bot.start();
