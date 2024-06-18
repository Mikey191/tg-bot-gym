const db = require("../db");
const adminMenuInlineKeyboard = require("../keyboards/adminMenuInlineKeyboard");
const createGroupListForDeleteInlineKeyboard = require("../keyboards/groupListForDeleteInlineKeyboard");

class UserController {
  async createGroup(ctx) {
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
      ctx.session.waitingForResponseCreateGroup = false;
      await ctx.answerCallbackQuery();
    }
  }
  async createExercises(ctx) {}
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
  async getExercises(ctx) {}
  async getUsers(ctx) {}

  async deleteGroup(ctx) {
    try {
      ctx.session.listGroupsCallbacks = await createGroupListForDeleteInlineKeyboard();
      console.log(
        `ctx.session.listGroupsCallbacks: ${ctx.session.listGroupsCallbacks}`
      );
      console.log("delete group try: ", ctx.callbackQuery.data);
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
      ctx.session.listGroupsCallbacks = null;
      ctx.session.waitingForResponseDeleteGroup = false;
      console.log(ctx.session.waitingForResponseDeleteGroup);
    }
  }
  async deleteExercise(ctx) {}
  async deleteUser(ctx) {}
}

module.exports = new UserController();
