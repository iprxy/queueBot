const _ = require('lodash')

module.exports = getKeyboard = (array, type, username) => {
  const keyboardButtons = array.map(item => {
    return {
      text: item,
      callback_data: `${type}|${item}|@${username}`
    }
  })
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: _.chunk(keyboardButtons, 5)
    })
  }
  return options
}