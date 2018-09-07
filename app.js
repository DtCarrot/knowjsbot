import request from 'request'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import TelegramBot from 'node-telegram-bot-api'
dotenv.config()
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const port = process.env.PORT
const url = process.env.WEBHOOK_URL
const bot = new TelegramBot(TELEGRAM_TOKEN)

import telegramBotHandler from './telegramBotHandler'
import redisClient from './redisClient'

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TELEGRAM_TOKEN}`)

const app = express()
app.use(bodyParser.json())

app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`)
})

telegramBotHandler(bot)
