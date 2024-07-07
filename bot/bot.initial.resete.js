async function reseteSessionInitial(ctx) {
  ctx.session.waitingForResponseCreateGroup = null;
  ctx.session.waitingForResponseDeleteGroup = null;
  ctx.session.waitingForResponseCreateExercise = null;
  ctx.session.waitingForResponseDeleteExercise = null;
  ctx.session.waitingForResponseCreateWight = null;
  ctx.session.waitingForResponseCreateCountEx = null;
  ctx.session.groupExercise = null;
  ctx.session.groupForTraningExercise = null;
  ctx.session.exerciseForTraining = null;
  ctx.session.exerciseWight = null;
  ctx.session.exerciseCount = null;
}

module.exports = reseteSessionInitial;