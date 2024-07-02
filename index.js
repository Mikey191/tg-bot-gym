require("dotenv").config();
const { session } = require("grammy");
const startGymInlineKeyboard = require("./keyboards/startGymInlineKeyboard");
const adminMenuInlineKeyboard = require("./keyboards/adminMenuInlineKeyboard");
const AdminBotController = require("./bot/controller/adminBot.controller");
const MainMenu = require("./bot/controller/mainMenu.controller");
const bot = require("./bot/bot");
const botError = require("./bot/bot.error");
const initial = require("./bot/bot.initial.session");
const groupsAndExercises = require("./database/groupsAndExercises");
const db = require("./database/db");

// Открытие сессии с переменными флагами для создания групп и упражнений
bot.use(session({ initial }));

// команда старт
bot.command("start", MainMenu.commands.start);
// Открытие основного управления приложением
bot.command("startgym", MainMenu.commands.startgym);
// Основные возможности для Админа
bot.callbackQuery("/adminmenu", MainMenu.callbackQuerys.adminMenu);

// Обработчик сообщений для создания группы или упражнения
bot.on("msg", AdminBotController.msgHandler);

// Функции Админа для работы с группами - start
//Создание группы
bot.callbackQuery("/cgroup", AdminBotController.groups.createGroup.stepOne);
// Загрузить все данные из файла database/groupsAndExercises.js
bot.callbackQuery("/loadge", async (ctx) => {
  try {
    // Проверка таблицы Groups на пустоту. Если она пустая - загрузка возможна, в противном случае сообщение о том, что таблица не пустая.
    const isempty = await db.query(`select count(*) from groups`);
    +isempty.rows[0].count
      ? console.log(`Есть записи`)
      : console.log(`Таблица пустая`);

    if (+isempty.rows[0].count) {
      await ctx.reply(
        `Таблица не пустая. Очистите таблицы и повторите попытку.`
      );
    } else {
      Object.entries(groupsAndExercises).forEach(async ([key, value]) => {
        // Записываем группу
        await db.query(`insert into groups (name) values ($1)`, [key]);
        value.forEach(async (item) => {
          // Записываем упражнение
          await db.query(
            `insert into exercises (name, namegroup) values ($1, $2)`,
            [item, key]
          );
          console.log(`${key}: ${item}`);
        });
      });
      await ctx.reply(
        "Группы мышц и упражнения загружены. Можете приступать к тренировкам."
      );
    }
  } catch (error) {
    console.log(`Ошибка загрузки групп и упражнений`, error);
    await ctx.reply(`Ошибка загрузки групп и упражнений`);
  } finally {
    await ctx.answerCallbackQuery();
  }
});
//Показать все группы
bot.callbackQuery(
  "/getgroups",
  AdminBotController.groups.showAllGroups.stepOne
);
//Удалить группу
bot.callbackQuery("/dgroup", AdminBotController.groups.deleteGroup.stepOne);
bot.callbackQuery(/deletegroup/, AdminBotController.groups.deleteGroup.stepTwo);
// Удалить все группы и все упражнения
bot.callbackQuery("/dellge", async (ctx) => {
  try {
    // Удаляем упражнения
    await db.query(`delete from exercises`);
    // Удаляем группы
    await db.query(`delete from groups`);
    await ctx.reply(`Группы и Упражнения удалены`);
  } catch (error) {
    console.log(`Ошибка удаления групп и упражнений`, error);
    await ctx.reply(`Ошибка удаления групп и упражнений`);
  } finally {
    await ctx.answerCallbackQuery();
  }
});
// Функции Админа для работы с группами - end

// Функции Админа для работы с упражнениями
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

// Обработчик ошибок
bot.catch(botError.errorHandler);
// Старт бота
bot.start();
