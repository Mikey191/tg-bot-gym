const statisticMenuInlineKeyboard = require("../../keyboards/statisticMenuInlineKeyboard");
const convertDate = require("../../utils/convertDate");
const db = require("../../database/db");

class StatisticController {
  constructor() {
    this.statisticUser = {
      statisticMenu: {
        async stepOne(ctx) {
          try {
            ctx.reply(`Ваша статистика подгатавливается...`, {
              reply_markup: statisticMenuInlineKeyboard,
            });
          } catch (error) {
            console.log(`ошибка statisticMenu stepOne`, error);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
      },
      statisticToday: {
        async stepOne(ctx) {
          try {
            console.log("Статистика сегодня");
            // Дата Сегодня
            const date = await convertDate(ctx.callbackQuery.message.date);
            // id пользователя
            const telegram_id = ctx.from.id;
            // Запрос к БД что бы вытащить все строки с упражнениями
            const res = await db.query(
              `select * from result_table where date = $1 and telegram_id = $2`,
              [date, telegram_id]
            );
            console.log(res.rows);
            if (res.rows.length) {
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
                      result += `\t\t\t${countExercise} подход: ${dayAllExercise[j].count} повторений по ${dayAllExercise[j].weight} кг.\n`;
                    }
                  }
                }
              }
              console.log(result);
              ctx.reply(`${result}`);
            } else {
              console.log(`Неправильная дата: `, ctx.message.text);
              await ctx.reply(`Вы ввели не корректную дату! Попробуйте сново.`);
            }
          } catch (error) {
            console.log("Ошибка статистика сегодня stepOne", error);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
      },
      statisticDay: {
        async stepOne(ctx) {
          try {
            console.log(`Статистика за определенную дату`);
            ctx.reply(
              `Статистика за определенный день.\nВведите Дату в формате дд.мм.гггг:`
            );
            ctx.session.waitingForResponseCreateDate = true;
          } catch (error) {
            console.log("Ошибка statisticDay шаг stepOne", error);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        async stepTwo(ctx) {
          try {
            const date = ctx.message.text;
            const telegram_id = ctx.message.from.id;
            // Запрос к БД с определенной датой. Список всех упражнений в эту дату
            const res = await db.query(
              `select * from result_table where date = $1 and telegram_id = $2`,
              [date, telegram_id]
            );
            if (res.rows.length) {
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
                      result += `\t\t\t${countExercise} подход: ${dayAllExercise[j].count} повторений по ${dayAllExercise[j].weight} кг.\n`;
                    }
                  }
                }
              }
              console.log(result);
              ctx.reply(`${result}`);
            } else {
              console.log(`Неправильная дата: `, ctx.message.text);
              await ctx.reply(`Вы ввели не корректную дату! Попробуйте сново.`);
            }
          } catch (error) {
            console.log(`Ошибка при распозновании даты.`, error);
            await ctx.reply(`Не смог распознать дату`);
          } finally {
          }
        },
      },
      statisticMonth: {},
      statisticRange: {},
    };
  }
}

module.exports = new StatisticController();
