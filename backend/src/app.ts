import express from "express"
import dotenv from 'dotenv'
import { router } from "./routes/routes";
import { specs, swaggerUi } from "./swagger";
import cors from 'cors'

dotenv.config();

const app = express();

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3001', // URL do frontend
    credentials: true
}));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/api', router)

// Health check endpoint for testing
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen((PORT), () => { console.log(`server rodando na porta ${PORT}`) })
}

export default app
