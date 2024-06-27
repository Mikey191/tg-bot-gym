const { InlineKeyboard } = require("grammy");
const db = require("../../db");

// Класс для создания inline keyboard списка групп для разных фаз
class InlineKeyboardGroupList {
  constructor() {
    //Колбэки для создания инлайн клавиатур
    const callbacks = {
      createExerciseGroup: "createexercisegroup",
      getGroupExercises: "getgroupexercises",
      deleteGroup: "deletegroup",
      deleteExerciseGroup: "deleteexercisegroup",
      deleteExercise: "deleteexercise",
    };
    // Создание списка групп
    async function createGroupList(callback) {
      const groups = await db.query(`select * from groups`);
      const groupListInlineKeyboard = new InlineKeyboard();
      for (const button of groups.rows) {
        groupListInlineKeyboard
          .text(
            button.name.toString().trim(),
            callback + button.name.toString().trim()
          )
          .row();
      }
      return groupListInlineKeyboard;
    }
    // клавиатура списка групп для удаления группы
    this.inlineKeyboardGroupForDeleteGroup = async function () {
      return createGroupList(callbacks.deleteGroup);
    };
    // клавиатура списка групп для удаления упражнения из определенной группы
    this.inlineKeyboardGroupForDeleteExercise = async function () {
      return createGroupList(callbacks.deleteExerciseGroup);
    };
    // клавиатура списка групп для показа упражнений определенной группы
    this.inlineKeyboardGroupForGetGroupExercise = async function () {
      return createGroupList(callbacks.getGroupExercises);
    };
    // клавиатура списка групп для создания в ней упражнения
    this.inlineKeyboardGroupForCreateExercise = async function () {
      return createGroupList(callbacks.createExerciseGroup);
    };
  }
}

module.exports = new InlineKeyboardGroupList();
