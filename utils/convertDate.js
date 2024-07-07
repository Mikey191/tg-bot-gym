async function convertDate(message_date) {
  const date = new Date(message_date * 1000);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

module.exports = convertDate;