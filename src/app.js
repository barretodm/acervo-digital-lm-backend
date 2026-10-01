import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'acervo-digital-lm-backend' })
})

export default app
