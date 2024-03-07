import express from 'express'

import App from './services/ExpressApp'
import dotenv from 'dotenv'
dotenv.config()
import Database from './services/Database'
import { PORT } from './config'


const StartServer = async () => {
  const app = express()

  await Database()

  await App(app)

  app.listen(PORT, () =>{
    console.log(`Listening on PORT ${PORT}`)
  })
}

StartServer()