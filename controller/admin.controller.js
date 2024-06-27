const db = require("../db");
const adminMenuInlineKeyboard = require("../keyboards/adminMenuInlineKeyboard");
const callbacks = require("../utils/callbacks");

class AdminController {
  async createGroup(ctx) {
    try {
      if (ctx.session.waitingForResponseCreateGroup) {
        await db.query(`insert into groups (name) values ($1)`, [
          ctx.message?.text,
        ]);
        console.log(`insert into groups (name) values (${ctx.message?.text})`);
        ctx.reply(`Группа ${ctx.message?.text} создана`, {
          reply_markup: adminMenuInlineKeyboard,
        });
      }
    } catch (error) {
      console.log(`Не смог добавить группу. `, error);
      ctx.reply(`Не смог добавить группу.`);
    } finally {
      ctx.session.waitingForResponseCreateGroup = false;
    }
  }
  async createExercises(ctx) {
    try {
      if (ctx.session.waitingForResponseCreateExercise) {
        console.log(`createExercises зашла в if`);
        const name = ctx.message?.text;
        const namegroup = ctx.session.groupExercise;
        await db.query(
          `INSERT INTO exercises (name, namegroup) VALUES ($1, $2)`,
          [name, namegroup]
        );
        await ctx.reply(`Упражнение ${name} создано в группе ${namegroup}`, {
          reply_markup: adminMenuInlineKeyboard,
        });
      }
    } catch (error) {
      console.log(`Ошибка создания упражнения: `, error);
      await ctx.reply(`Ошибка создания упражнения`);
    } finally {
      ctx.session.waitingForResponseCreateExercise = false;
      ctx.session.groupExercise = null;
    }
  }
  async createUser(ctx) {}

  async getGroups(ctx) {
    try {
      const groupsList = await (await db.query(`select * from groups`)).rows;
      const groupListStr = groupsList.map((button) => button.name).join("\n");
      console.log(groupListStr);
      ctx.reply(`Список групп:\n${groupListStr}`);
    } catch (error) {
      console.log(`Ошибка при формировании списка групп`, error);
      ctx.reply(`Ошибка формирования списка групп. Поробуйте еще раз.`);
    }
    await ctx.answerCallbackQuery();
  }
  async getExercises(ctx) {
    try {
      console.log(ctx.callbackQuery.data);
      const nameGroup = ctx.callbackQuery.data.replace(
        callbacks.getGroupExercises,
        ""
      );
      console.log(nameGroup);
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
      ctx.reply(`Ошибка формирования списка упражнений. Поробуйте еще раз.`);
    } finally {
    }
  }
  async getUsers(ctx) {}

  async deleteGroup(ctx) {
    try {
      console.log("delete group try: ", ctx.callbackQuery.data);
      // Удалить все упражнения, которые относяться к этой группе

      // Потом удалить саму группу
      await db.query(`delete from groups where name = $1`, [
        ctx.callbackQuery.data.replace(callbacks.deleteGroup, ""),
      ]);
      ctx.reply(
        `Группа ${ctx.callbackQuery.data.replace(
          callbacks.deleteGroup,
          ""
        )} удалена.`,
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
      console.log(ctx.session.waitingForResponseDeleteGroup);
      await ctx.answerCallbackQuery();
    }
  }
  async deleteExercise(ctx) {}
  async deleteUser(ctx) {}
  // Обработчик сообщений
  async createGroupExerciseMessageHandler(ctx) {
    if (ctx.session.waitingForResponseCreateGroup) {
      // создание группы
      try {
        await db.query(`insert into groups (name) values ($1)`, [
          ctx.message?.text,
        ]);
        console.log(`insert into groups (name) values (${ctx.message?.text})`);
        ctx.reply(`Группа ${ctx.message?.text} создана`, {
          reply_markup: adminMenuInlineKeyboard,
        });
      } catch (error) {
        console.log(`Не смог добавить группу. `, error);
        await ctx.reply(`Не смог добавить группу.`);
      } finally {
        ctx.session.waitingForResponseCreateGroup = false;
      }
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

module.exports = new AdminController();
