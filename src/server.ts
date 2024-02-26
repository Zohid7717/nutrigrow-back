import express from "express"
import bodyParser from "body-parser"
import fetch from "node-fetch"
import cors from "cors"
import { config } from "dotenv";
import mongoose from "mongoose";
import { MongoClient, ServerApiVersion } from "mongodb";


const app = express()

config()

const PORT = process.env.PORT || 3001
const MONGO_URL: string | undefined = process.env.MONGO_URL

app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

app.post('/api/submit-message', async (req, res) => {
  try {
    const { name, number, message } = req.body
    const telegramMessage = `New client message:
    Name: ${name},
    Number: ${number},
    Message: ${message}`
    await sendTelegramMessage(telegramMessage)
    res.status(200).json({ success: true, message: 'Письмо отправлено.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Произошло ошибка при обработке данных. Повторите попытку.' })
  }
})

async function sendTelegramMessage(message: string) {
  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  })
}


async function start() {
  console.log(MONGO_URL, PORT)
  if (MONGO_URL) {
    const client = new MongoClient(MONGO_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    try {
      await client.connect()
      const database = client.db("Nutrigrow")
      const result = await database.command({ping:1})
      app.listen(PORT, () => {
        console.log("Server started")
      })
      console.log("Pinged your deployment. You successfully connected to MongoDB!")
    }

    catch (error) {
      await client.close()
      console.log(error)
   }
  }
}

start().catch(console.dir)