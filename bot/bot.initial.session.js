function initialSession() {
  return {
    waitingForResponseCreateGroup: null,
    waitingForResponseDeleteGroup: null,
    waitingForResponseCreateExercise: null,
    waitingForResponseDeleteExercise: null,
    groupExercise: null,
  };
}

module.exports = initialSession;