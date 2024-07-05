function initialSession() {
  return {
    waitingForResponseCreateGroup: null,
    waitingForResponseDeleteGroup: null,
    waitingForResponseCreateExercise: null,
    waitingForResponseDeleteExercise: null,
    waitingForResponseCreateWight: null,
    waitingForResponseCreateCountEx: null,
    groupExercise: null,
    groupForTraningExercise: null,
    exerciseForTraining: null,
    exerciseWight: null,
    exerciseCount: null,
  };
}

module.exports = initialSession;