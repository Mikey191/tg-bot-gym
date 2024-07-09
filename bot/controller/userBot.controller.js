const inlineKeyboardExerciseList = require("../../keyboards/inlineKeyboards/inlineKeyboardExerciseList");
const InlineKeyboardGroupList = require("../../keyboards/inlineKeyboards/InlineKeyboardGroupList");
const userStartTrainInlineKeyboard = require("../../keyboards/userStartTrainInlineKeyboard");
const convertDate = require("../../utils/convertDate");
const reseteSessionInitial = require("../bot.initial.resete");
const db = require("../../database/db");
const endExercises = require("../../keyboards/endExercises");
const groupsAndExercises = require("../../database/groupsAndExercises");

class UserBotController {
  constructor() {
    // Процесс тренировки Пользователя
    this.workout = {
      workoutProcess: {
        // Клавиатура с выбором Тренировки или статистики
        async stepOne(ctx) {
          ctx.reply(
            `Начните тренировку нажав на кнопку "Начать тренировку" или посмотрите статистику ваших тренировок нажав на кнопку "Моя статистика"`,
            {
              reply_markup: userStartTrainInlineKeyboard,
            }
          );
        },
        // Выбор группы мышц
        async stepTwo(ctx) {
          ctx.reply(`Выбирите группу мышц которую будите тренировать:`, {
            reply_markup:
              await InlineKeyboardGroupList.inlineKeyboardGroupForStartTraning(),
          });
          await reseteSessionInitial(ctx);
        },
        // Выбор упражнения из выбранной группы мышц
        async stepThree(ctx) {
          try {
            // Получение группы мышц
            ctx.session.groupExercise = ctx.callbackQuery.data.replace(
              InlineKeyboardGroupList.callbacks.startTrainingGroup,
              ""
            );
            ctx.reply(
              `Выбирите упражнение из Группы ${ctx.session.groupExercise}`,
              {
                reply_markup:
                  await inlineKeyboardExerciseList.inlineKeyboardExerciseForStartTraining(
                    ctx
                  ),
              }
            );
          } catch (error) {
            console.log(error);
            await ctx.reply(`Ошибка вывода упражнений`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Записать упражнение в сессию и запросить ввод веса снаряда
        async stepFour(ctx) {
          if (!ctx.session.exerciseForTraining) {
            const exerciseWithoutEnd = ctx.callbackQuery.data.replace(
              inlineKeyboardExerciseList.callbacks.startTrainingExercise,
              ""
            );
            const groupName = ctx.session.groupExercise;
            // let exerciseFullName = '';
            groupsAndExercises[groupName].forEach((item) => {
              if (item.startsWith(exerciseWithoutEnd)) {
                ctx.session.exerciseForTraining = item;
              }
            });
          }
          // Запрос на введение веса снаряда
          ctx.reply(`Введите вес снаряда`);
          // Установить флаг для записи веса снаряда
          ctx.session.waitingForResponseCreateWight = true;
        },
        // Записать вес снаряда в сессию и запросить ввод количества повторений
        async stepFive(ctx) {
          const weight = +ctx.message?.text;
          ctx.session.exerciseWight = weight;
          // запрос на введение количества повторений упражнения
          ctx.reply(`Введите количество повторений:`);
          // Установление флага для количесвта повторений в true
          ctx.session.waitingForResponseCreateCountEx = true;
          // Установление флага для веса в false
          ctx.session.waitingForResponseCreateWight = false;
        },
        // Записать количесвто повторений упражнения и записать все данные в БД
        async stepSix(ctx) {
          // Список всех нужных переменных
          const telegram_id = ctx.message.from.id;
          const date = await convertDate(ctx.message.date);
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
              reply_markup: endExercises,
            }
          );
          // Обнуление сессии
          await reseteSessionInitial(ctx);
          // оставить старые значения если пользователь захочет продолжить
          ctx.session.groupExercise = group_name;
          ctx.session.exerciseForTraining = exercises_name;
        },
      },
    };
    // Работа со статистикой
    this.statistic = {
      async statisticMenu(ctx) {},
      async statisticToday(ctx) {},
      async statisticDay(ctx) {},
      async statisticMonth(ctx) {},
      async statisticRange(ctx) {},
    };
  }
}

module.exports = new UserBotController();
