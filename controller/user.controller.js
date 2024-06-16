const db = require("../db");
const adminMenuInlineKeyboard = require("../keyboards/adminMenuInlineKeyboard");
const createInlineKeyboard = require("../keyboards/groupListInlineKeyboard");

class UserController {
  async createGroup(ctx) {
    await ctx.answerCallbackQuery();
    try {
      if (ctx.session.waitingForResponseCreateGroup) {
        await db.query(`insert into groups (name) values ($1)`, [
          ctx.message?.text,
        ]);
        console.log(
          `insert into groups (name) values (${ctx.message?.text}) return *`
        );
        ctx.reply(`Группа ${ctx.message?.text} создана`, {
          reply_markup: adminMenuInlineKeyboard,
        });
      }
    } catch (error) {
      console.log(`Не смог добавить группу. `, error);
      ctx.reply(`Не смог добавить группу.`);
    } finally {
      // Сбрасываем значение в сессии
      ctx.session.waitingForResponseCreateGroup = false;
    }
  }

  async createExercises(ctx) {
    if (ctx.session.waitingForResponseCreateExercise) {
      ctx.session.waitingForResponseCreateGroup = false;
    }
    console.log(
      `End od session: ${ctx.session.waitingForResponseCreateExercise}`
    );
  }
  async createUser(ctx) {}

  async getGroups(ctx) {
    await ctx.answerCallbackQuery();
    const groupsList = await (await db.query(`select * from groups`)).rows;
    const groupListStr = groupsList.map((button) => button.name).join("\n");
    console.log(groupListStr);
    ctx.reply(`Список групп:\n${groupListStr}`);
  }
  async getExercises(ctx) {}
  async getUsers(ctx) {}

  async deleteGroup(ctx) {
    try {
      console.log(ctx.callbackQuery.data);
      await db.query(`delete from groups where name = $1`, [
        ctx.callbackQuery.data,
      ]);
      ctx.reply(`Группа ${ctx.callbackQuery.data} удалена.`, {
        reply_markup: adminMenuInlineKeyboard,
      });
      console.log(`Группа ${ctx.callbackQuery.data} удалена.`);
    } catch (error) {
      console.log(`Ошибка при удалении группы.`, error);
      ctx.reply(`Ошибка при удалении группы.`);
    } finally {
      ctx.session.waitingForResponseDeleteGroup = false;
    }
  }
  async deleteExercise(ctx) {}
  async deleteUser(ctx) {}
}

module.exports = new UserController();
