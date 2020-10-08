const { Telegraf } = require('telegraf')
const token = 'YOUR_BOT_TOKEN'
const bot = new Telegraf(token)

const Queue = require('./queue')
const queue = new Queue()

const getKeyboard = require('./utils/getKeyboard')

bot.start(ctx => {
  const msg =
    'Привет!\n' +
    'Я помогаю забронировать место в очереди.\n' +
    '🤖 /help — узнать команды'
  ctx.reply(msg)
})
bot.help(ctx => {
  const msg =
    '✍ /queue — забронировать слот\n' +
    '🙅‍♂️ /cancel — отменить бронь\n' +
    '🆓 /slots — посмотреть свободные слоты'
  ctx.reply(msg)
})

bot.command('queue', async (ctx) => {
  const chatId = ctx.message.chat.id
  const username = ctx.message.chat.username ? ctx.message.chat.username : chatId
  const todayData = await queue.getTodayFile()
  const freeSlots = Object.keys(todayData).filter(item => !todayData[item].length)
  if (!freeSlots.length) {
    ctx.reply('😣 Все слоты заняты')
  } else {
    ctx.reply('🤔 Выбери время', getKeyboard(freeSlots, 'set', username))
  }
})

bot.command('cancel', async (ctx) => {
  const chatId = ctx.message.chat.id
  const username = ctx.message.chat.username ? ctx.message.chat.username : chatId
  const todayData = await queue.getTodayFile()
  const userSlots = Object.keys(todayData).filter(item => todayData[item] === `@${username}`)
  if (!userSlots.length) {
    ctx.reply('🙇‍♂️ У тебя сегодня не забронировано время, отменять нечего')
  } else {
    ctx.reply('🤔 Выбери время', getKeyboard(userSlots, 'cancel', username))
  }
})

bot.command('slots', async (ctx) => {
  const todayData = await queue.getTodayFile()
  const slots = Object.keys(todayData)
    .map(item => `<b>${item}</b>: ${todayData[item].length ? todayData[item] : 'свободно'}`)
    .join('\n')
  ctx.reply(slots, { parse_mode: 'HTML' })
})

bot.on('callback_query', async (ctx) => {
  const messageId = ctx.callbackQuery.message.message_id
  const chatId = ctx.callbackQuery.message.chat.id
  const data = ctx.callbackQuery.data.split('|')
  const type = data[0]
  const time = data[1]
  const username = data[2]

  if (type === 'set') {
    const setTime = await queue.setQueue(time, username)
    const messageText = !setTime
      ? '❌ Это время уже занято'
      : `✅ Забронировал на ${time}\n` +
      '🙅‍♂️ /cancel — отменить бронь\n' +
      '🆓 /slots — посмотреть свободные слоты'
    ctx.telegram.editMessageText(chatId, messageId, '', messageText)
  } else if (type === 'cancel') {
    const cancelTime = await queue.removeQueue(time, username)
    const messageText = !cancelTime
      ? '❌ Ты пытаешься отменить не своё время, либо это время свободно.'
      : `✅ Отменил слот на ${time}\n` +
      '✍ /queue — забронировать слот\n' +
      '🆓 /slots — посмотреть свободные слоты'
    ctx.telegram.editMessageText(chatId, messageId, '', messageText)
  }
})

bot.launch()
