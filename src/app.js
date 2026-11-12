import express from 'express'
import cors from 'cors'
import { db } from './config/db.js'
import { supabase } from './config/supabase.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1')
    const { error } = await supabase.storage.getBucket('fotos-obra')
    if (error) throw error
    res.json({ status: 'ok', service: 'acervo-digital-lm-backend', db: 'ok', storage: 'ok' })
  } catch (error) {
    console.error('Falha ao conectar com Supabase/Postgres:', error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

export default app
