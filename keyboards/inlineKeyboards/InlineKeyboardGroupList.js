const { InlineKeyboard } = require("grammy");
const db = require("../../database/db");

// Класс для создания inline keyboard списка групп для разных фаз
class InlineKeyboardGroupList {
  constructor() {
    //Колбэки для создания инлайн клавиатур
    this.callbacks = {
      createExerciseGroup: "createexercisegroup",
      getGroupExercises: "getgroupexercises",
      deleteGroup: "deletegroup",
      deleteExerciseGroup: "deleteexercisegroup",
    };
    // Создание списка групп
    async function createGroupList(callback) {
      const groups = await db.query(`select * from groups`);
      const groupListInlineKeyboard = new InlineKeyboard();
      for (const button of groups.rows) {
        groupListInlineKeyboard
          .text(
            button.name.toString().trim(),
            (callback + button.name.toString().trim()).slice(0, 40)
          )
          .row();
      }
      return groupListInlineKeyboard;
    }
    // клавиатура списка групп для удаления группы
    this.inlineKeyboardGroupForDeleteGroup = async function () {
      return createGroupList(this.callbacks.deleteGroup);
    };
    // клавиатура списка групп для удаления упражнения из определенной группы
    this.inlineKeyboardGroupForDeleteExercise = async function () {
      return createGroupList(this.callbacks.deleteExerciseGroup);
    };
    // клавиатура списка групп для показа упражнений определенной группы
    this.inlineKeyboardGroupForGetGroupExercise = async function () {
      return createGroupList(this.callbacks.getGroupExercises);
    };
    // клавиатура списка групп для создания в ней упражнения
    this.inlineKeyboardGroupForCreateExercise = async function () {
      return createGroupList(this.callbacks.createExerciseGroup);
    };
  }
}

module.exports = new InlineKeyboardGroupList();
