import express from "express"
import dotenv from 'dotenv'
import { router } from "./routes/routes";
import { specs, swaggerUi } from "./swagger";

dotenv.config();

const app = express();

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/api', router)
const PORT = process.env.PORT || 3000;


app.listen((PORT), () => { console.log(`server rodando na porta ${PORT}`) })
