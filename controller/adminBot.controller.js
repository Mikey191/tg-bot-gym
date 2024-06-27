const db = require("../db");
const adminMenuInlineKeyboard = require("../keyboards/adminMenuInlineKeyboard");
const InlineKeyboardGroupList = require("../keyboards/inlineKeyboards/InlineKeyboardGroupList");

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
      deleteGroup: {
       // Шаг 1 Выбрать группу из списка
        async stepOne(ctx) {
           await ctx.answerCallbackQuery();
           ctx.session.waitingForResponseDeleteGroup = true;
           await ctx.reply(`Выбирите группу для удаления: `, {
             reply_markup:
               await InlineKeyboardGroupList.inlineKeyboardGroupForDeleteGroup(),
           });
        },
        stepTwo() {
          // Шаг 2 для удаления группы
        },
        stepThree() {
          // Шаг 3 для удаления группы
        },
      },
    };

    // Работа с упражнениями
    this.exercises = {
      createExercise: {
        stepOne() {
          // Шаг 1 для создания упражнения
        },
        stepTwo() {
          // Шаг 2 для создания упражнения
        },
      },
      showAllExercises: {
        stepOne() {
          // Шаг 1 для показа всех упражнений определенной группы
        },
        stepTwo() {
          // Шаг 2 для показа всех упражнений определенной группы
        },
      },
      deleteExercise: {
        stepOne() {
          // Шаг 1 для удаления упражнения из определенной группы
        },
        stepTwo() {
          // Шаг 2 для удаления упражнения из определенной группы
        },
        stepThree() {
          // Шаг 3 для удаления упражнения из определенной группы
        },
      },
    };
    // Обработчик обычных сообщений для создания группы или упражнения
    this.msgHandler = async (ctx) => {
      if (ctx.session.waitingForResponseCreateGroup) {
        await this.groups.createGroup.stepTwo(ctx);
      } else if (ctx.session.waitingForResponseCreateExercise) {
        //создание упражнения
        try {
          const name = ctx.message?.text;
          const namegroup = ctx.session.groupExercise;
          await db.query(
            `INSERT INTO exercises (name, namegroup) VALUES ($1, $2)`,
            [name, namegroup]
          );
          await ctx.reply(`Упражнение ${name} создано в группе ${namegroup}`, {
            reply_markup: adminMenuInlineKeyboard,
          });
        } catch (error) {
          console.log(`Ошибка создания упражнения: `, error);
          await ctx.reply(`Ошибка создания упражнения`);
        } finally {
          ctx.session.waitingForResponseCreateExercise = false;
          ctx.session.groupExercise = null;
        }
      } else {
        ctx.reply(`Не понимаю команды. Попробуй снова!`);
      }
    }
  }

}

module.exports = new AdminBotController();
