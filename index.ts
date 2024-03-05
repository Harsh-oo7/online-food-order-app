import express from 'express'

import App from './services/ExpressApp'
import Database from './services/Database'

const StartServer = async () => {
  const app = express()

  await Database()

  await App(app)

  app.listen(8000, () =>{
    console.log('Listening on PORT 8000')
  })
}

StartServer()