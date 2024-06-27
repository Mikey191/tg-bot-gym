require("dotenv").config();
const db = require("./db");
const { Bot, GrammyError, HttpError, session } = require("grammy");
const AdminController = require("./controller/admin.controller");
const startGymInlineKeyboard = require("./keyboards/startGymInlineKeyboard");
const adminMenuInlineKeyboard = require("./keyboards/adminMenuInlineKeyboard");
const createGroupListInlineKeyboard = require("./keyboards/groupListDelete");
const createGroupListAddExercise = require("./keyboards/groupListAddExercise");
const callbacks = require("./utils/callbacks");
const createGroupListGetExercise = require("./keyboards/groupListGetExercises");
const createGroupListDeleteExercise = require("./keyboards/groupListDeleteExercise");
const createExerciseListDelete = require("./keyboards/exercisesListDelete");

const AdminBotController = require("./controller/adminBot.controller");

const bot = new Bot(process.env.BOT_API_KEY);
// Открытие сессии с переменными флагами для создания групп и упражнений
function initial() {
  return {
    waitingForResponseCreateGroup: null,
    waitingForResponseDeleteGroup: null,
    waitingForResponseCreateExercise: null,
    waitingForResponseDeleteExercise: null,
    groupExercise: null,
  };
}
bot.use(session({ initial }));

// команда старт
bot.command("start", async (ctx) => {
  await ctx.reply(
    `Вас приветствует Бот для спортивного зала GymBot. С помощью меня вы можите создавать свои программы или воспользоваться уже созданными. Так же вы можите создавать свои группы мышц и упражнения для них. Для этого введите команду /startgym`
  );
});
// Открытие основного управления приложением
bot.command("startgym", async (ctx) => {
  await ctx.reply(
    `Нажмите на ПАНЕЛЬ УПРАВЛЕНИЯ для открытия функций АДМИНИСТРАТОРА.\nНажмите на ПАНЕЛЬ ПОЛЬЗОВАТЕЛЯ для перехода в режим ПОЛЬЗОВАТЕЛЯ.
    `,
    {
      reply_markup: startGymInlineKeyboard,
    }
  );
});
// Основные возможности для Админа
bot.callbackQuery("/adminmenu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    `Вы вошли в режим админа.\nТут вы можете:\n- создавать свои "Группы Мыщц"\n- создавать свои "Упражнения для группы"\n- удалять уже существующие "Группы Мыщц"\n- удалять уже существующие "Упражнения для группы"`,
    {
      reply_markup: adminMenuInlineKeyboard,
    }
  );
});

// Обработчик сообщений для создания группы или упражнения
bot.on("msg", AdminBotController.msgHandler);

// Функции Админа для работы с группами - start
//Создание группы
bot.callbackQuery("/cgroup", AdminBotController.groups.createGroup.stepOne);
//Показать все группы
bot.callbackQuery(
  "/getgroups",
  AdminBotController.groups.showAllGroups.stepOne
);
//Удалить группу
bot.callbackQuery("/dgroup", AdminBotController.groups.deleteGroup.stepOne);
bot.callbackQuery(/deletegroup/, AdminController.deleteGroup);
// Функции Админа для работы с группами - end

// Функции Админа для работы с упражнениями
// Создание упражнения
bot.callbackQuery("/cexer", async (ctx) => {
  try {
    ctx.session.waitingForResponseCreateExercise = true;
    await ctx.reply(`Выберите группу для добавления в нее упражнения:`, {
      reply_markup: await createGroupListAddExercise(),
    });
  } catch (error) {
    console.log(error);
    await ctx.reply(`Ошибка вывода групп`);
  }
});
bot.callbackQuery(/createexercisegroup/, async (ctx) => {
  ctx.session.groupExercise = ctx.callbackQuery.data.replace(
    callbacks.createExerciseGroup,
    ""
  );
  await ctx.reply(`Введите название упражнения:`);
});
// Показать все упражнения определенной группы
bot.callbackQuery("/getexer", async (ctx) => {
  try {
    await ctx.reply(
      `Выберите группу упражнений для просмотра упражнений в ней:`,
      {
        reply_markup: await createGroupListGetExercise(),
      }
    );
  } catch (error) {
    console.log(error);
    await ctx.reply(`Ошибка вывода групп`);
  }
});
bot.callbackQuery(/getgroupexercises/, AdminController.getExercises);
// Удаление упражнения из определенной группы
bot.callbackQuery("/dexer", async (ctx) => {
  try {
    await ctx.reply(`Выберите группу для удаления из нее упражнения:`, {
      reply_markup: await createGroupListDeleteExercise(),
    });
  } catch (error) {
    console.log(error);
    await ctx.reply(`Ошибка вывода групп`);
  }
});
bot.callbackQuery(/deleteexercisegroup/, async (ctx) => {
  try {
    ctx.session.groupExercise = ctx.callbackQuery.data.replace(
      callbacks.deleteExerciseGroup,
      ""
    );
    await ctx.reply(`Выбирите упражнение, которое хотите удалить:`, {
      reply_markup: await createExerciseListDelete(ctx),
    });
  } catch (error) {
    console.log(error);
    await ctx.reply(`Ошибка вывода упражнений`);
  }
});
bot.callbackQuery(/deleteexercise/, async (ctx) => {
  try {
    const nameGroup = ctx.session.groupExercise;
    const nameExercise = ctx.callbackQuery.data.replace(
      callbacks.deleteExercise,
      ""
    );
    await db.query(`delete from exercises where name = $1 and namegroup = $2`, [
      nameExercise,
      nameGroup,
    ]);
    ctx.reply(`Упражнение ${nameExercise} удалено из группы ${nameGroup}`, {
      reply_markup: adminMenuInlineKeyboard,
    });
  } catch (error) {
    console.log(`Ошибка удаления упражнения`, error);
    await ctx.reply(`Ошибка удаления упражнения`);
  }
});

// Обработчик ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error(`Could not contact Telegram:`, e);
  } else {
    console.error(`Unknown error:`, e);
  }
});
// Старт бота
bot.start();
