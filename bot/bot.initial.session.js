function initialSession() {
  return {
    waitingForResponseCreateGroup: null,
    waitingForResponseDeleteGroup: null,
    waitingForResponseCreateExercise: null,
    waitingForResponseDeleteExercise: null,
    waitingForResponseCreateWight: null,
    waitingForResponseCreateCountEx: null,
    waitingForResponseCreateDate: null,
    groupExercise: null,
    groupForTraningExercise: null,
    exerciseForTraining: null,
    exerciseWight: null,
    exerciseCount: null,
    // Статистика
    statisticToday: null,
    statisticDay: null,
    statisticMonth: null,
    statisticRange: null,
  };
}

module.exports = initialSession;