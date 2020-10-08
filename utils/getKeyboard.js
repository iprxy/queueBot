const getKeyboard = (array, type, username) => {
  const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  const keyboardButtons = array.map(item => {
    return {
      text: item,
      callback_data: `${type}|${item}|@${username}`
    }
  })
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: chunk(keyboardButtons, 5)
    })
  }
  return options
}

module.exports = getKeyboard
