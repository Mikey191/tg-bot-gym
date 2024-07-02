const db = require("../../database/db");
const adminMenuInlineKeyboard = require("../../keyboards/adminMenuInlineKeyboard");
const InlineKeyboardGroupList = require("../../keyboards/inlineKeyboards/InlineKeyboardGroupList");
const inlineKeyboardExerciseList = require("../../keyboards/inlineKeyboards/inlineKeyboardExerciseList");

class AdminBotController {
  constructor() {
    // Работа с группами
    this.groups = {
      // Создание группы
      createGroup: {
        // Шаг 1
        async stepOne(ctx) {
          await ctx.answerCallbackQuery();
          ctx.session.waitingForResponseCreateGroup = true;
          await ctx.reply(`Введите название группы:`);
        },
        // Шаг 2
        async stepTwo(ctx) {
          try {
            await db.query(`insert into groups (name) values ($1)`, [
              ctx.message?.text,
            ]);
            ctx.reply(`Группа ${ctx.message?.text} создана`, {
              reply_markup: adminMenuInlineKeyboard,
            });
          } catch (error) {
            console.log(`Не смог добавить группу. `, error);
            await ctx.reply(`Не смог добавить группу.`);
          } finally {
            ctx.session.waitingForResponseCreateGroup = false;
          }
        },
      },
      // Показать список групп в сообщении
      showAllGroups: {
        // Шаг 1
        async stepOne(ctx) {
          try {
            const groupsList = await (
              await db.query(`select * from groups`)
            ).rows;
            const groupListStr = groupsList
              .map((button) => button.name)
              .join("\n");
            ctx.reply(`Список групп:\n${groupListStr}`);
          } catch (error) {
            console.log(`Ошибка списка групп`, error);
            ctx.reply(`Ошибка списка групп. Поробуйте еще раз.`);
          }
          await ctx.answerCallbackQuery();
        },
      },
      // Удаление группы
      deleteGroup: {
        // Шаг 1 Выбрать группу из списка
        async stepOne(ctx) {
          await ctx.answerCallbackQuery();
          ctx.session.waitingForResponseDeleteGroup = true;
          await ctx.reply(
            `Выбирите группу для удаления (Вместе с группой удалятся все упражнения входящие в эту группу): `,
            {
              reply_markup:
                await InlineKeyboardGroupList.inlineKeyboardGroupForDeleteGroup(),
            }
          );
        },
        // Шаг 2 Удалить группу и все упражнения с этой группой
        async stepTwo(ctx) {
          try {
            console.log("delete group try: ", ctx.callbackQuery.data);
            // Удалить все упражнения, которые относяться к этой группе
            await db.query(`delete from exercises where namegroup = $1`, [
              ctx.callbackQuery.data.replace(
                InlineKeyboardGroupList.callbacks.deleteGroup,
                ""
              ),
            ]);
            // Удалить саму группу
            await db.query(`delete from groups where name = $1`, [
              ctx.callbackQuery.data.replace(
                InlineKeyboardGroupList.callbacks.deleteGroup,
                ""
              ),
            ]);
            ctx.reply(
              `Группа ${ctx.callbackQuery.data.replace(
                InlineKeyboardGroupList.callbacks.deleteGroup,
                ""
              )} и упражнения в ней удалены.`,
              {
                reply_markup: adminMenuInlineKeyboard,
              }
            );
            console.log(`Группа ${ctx.callbackQuery.data} удалена.`);
          } catch (error) {
            console.log(`Ошибка при удалении группы.`, error);
            ctx.reply(`Ошибка при удалении группы.`);
          } finally {
            ctx.session.waitingForResponseDeleteGroup = false;
            await ctx.answerCallbackQuery();
          }
        },
      },
      // Загрузка всех групп и упражнений из /database/groupsAndExercises.js
      loadGroupsAndExercises: {
        async stepOne(ctx) {},
      },
    };

    // Работа с упражнениями
    this.exercises = {
      createExercise: {
        // Шаг 1
        async stepOne(ctx) {
          try {
            ctx.session.waitingForResponseCreateExercise = true;
            await ctx.reply(
              `Выберите группу для добавления в нее упражнения:`,
              {
                reply_markup:
                  await InlineKeyboardGroupList.inlineKeyboardGroupForCreateExercise(),
              }
            );
          } catch (error) {
            console.log(error);
            await ctx.reply(`Ошибка вывода групп.`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Шаг 2
        async stepTwo(ctx) {
          try {
            ctx.session.groupExercise = ctx.callbackQuery.data.replace(
              InlineKeyboardGroupList.callbacks.createExerciseGroup,
              ""
            );
            await ctx.reply(`Введите название упражнения:`);
          } catch (error) {
            console.log(`Ошибка для ввода упражнения`, error);
            await ctx.reply(`Ошибка для ввода упражнения`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Шаг 3
        async stepThree(ctx) {
          try {
            const name = ctx.message?.text;
            const namegroup = ctx.session.groupExercise;
            await db.query(
              `INSERT INTO exercises (name, namegroup) VALUES ($1, $2)`,
              [name, namegroup]
            );
            await ctx.reply(
              `Упражнение ${name} создано в группе ${namegroup}`,
              {
                reply_markup: adminMenuInlineKeyboard,
              }
            );
          } catch (error) {
            console.log(`Ошибка создания упражнения: `, error);
            await ctx.reply(`Ошибка создания упражнения`);
          } finally {
            ctx.session.waitingForResponseCreateExercise = false;
            ctx.session.groupExercise = null;
            await ctx.answerCallbackQuery();
          }
        },
      },
      showAllExercises: {
        // Шаг 1 для показа всех упражнений определенной группы
        async stepOne(ctx) {
          try {
            await ctx.reply(
              `Выберите группу упражнений для просмотра упражнений в ней:`,
              {
                reply_markup:
                  await InlineKeyboardGroupList.inlineKeyboardGroupForGetGroupExercise(),
              }
            );
          } catch (error) {
            console.log(error);
            await ctx.reply(`Ошибка вывода групп`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Шаг 2 для показа всех упражнений определенной группы
        async stepTwo(ctx) {
          try {
            const nameGroup = ctx.callbackQuery.data.replace(
              InlineKeyboardGroupList.callbacks.getGroupExercises,
              ""
            );
            const exercisesList = await db.query(
              `select name from exercises where namegroup = $1`,
              [nameGroup]
            );
            console.log(exercisesList.rows);
            if (exercisesList.rows) {
              const exercisesListStr = exercisesList.rows
                .map((exercise) => exercise.name)
                .join("\n");
              await ctx.reply(
                `Список упражнений для группы ${nameGroup}:\n${exercisesListStr}`
              );
            } else {
              await ctx.reply(`Список упражнений пуст...`);
            }
          } catch (error) {
            console.log(`Ошибка при формировании списка упражнений`, error);
            ctx.reply(
              `Ошибка формирования списка упражнений. Поробуйте еще раз.`
            );
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
      },
      deleteExercise: {
        // Шаг 1 для удаления упражнения из определенной группы
        async stepOne(ctx) {
          try {
            await ctx.reply(`Выберите группу для удаления из нее упражнения:`, {
              reply_markup:
                await InlineKeyboardGroupList.inlineKeyboardGroupForDeleteExercise(),
            });
          } catch (error) {
            console.log(error);
            await ctx.reply(`Ошибка вывода групп`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Шаг 2 для удаления упражнения из определенной группы
        async stepTwo(ctx) {
          console.log(`Зашел во второй Шаг удаления упражнения`);
          try {
            ctx.session.groupExercise = ctx.callbackQuery.data.replace(
              InlineKeyboardGroupList.callbacks.deleteExerciseGroup,
              ""
            );
            await ctx.reply(`Выбирите упражнение, которое хотите удалить:`, {
              reply_markup:
                await inlineKeyboardExerciseList.inlineKeyboardExerciseForDeleteExercise(
                  ctx
                ),
            });
          } catch (error) {
            console.log(error);
            await ctx.reply(`Ошибка вывода упражнений`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
        // Шаг 3 для удаления упражнения из определенной группы
        async stepThree(ctx) {
          try {
            const nameGroup = ctx.session.groupExercise;
            const nameExercise = ctx.callbackQuery.data.replace(
              inlineKeyboardExerciseList.callbacks.deleteExercise,
              ""
            );
            await db.query(
              `delete from exercises where name = $1 and namegroup = $2`,
              [nameExercise, nameGroup]
            );
            ctx.reply(
              `Упражнение ${nameExercise} удалено из группы ${nameGroup}`,
              {
                reply_markup: adminMenuInlineKeyboard,
              }
            );
          } catch (error) {
            console.log(`Ошибка удаления упражнения`, error);
            await ctx.reply(`Ошибка удаления упражнения`);
          } finally {
            await ctx.answerCallbackQuery();
          }
        },
      },
    };

    // Удаления всех групп и упражнений из БД

    // Обработчик обычных сообщений для создания группы или упражнения
    this.msgHandler = async (ctx) => {
      if (ctx.session.waitingForResponseCreateGroup) {
        // создание группы
        await this.groups.createGroup.stepTwo(ctx);
      } else if (ctx.session.waitingForResponseCreateExercise) {
        //создание упражнения
        await this.exercises.createExercise.stepThree(ctx);
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    };
  }
}

module.exports = new AdminBotController();
