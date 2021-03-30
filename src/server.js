import express from 'express';
import cors  from 'cors';
import {connect} from '../config/db'
import fileRoute from '../routes/file'
 
const app = express();
const port= process.env.PORT||3001

// Cors 
// const corsOptions = {
  // origin: process.env.ALLOWED_CLIENTS.split(',')
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
// }
app.use(cors())
app.use(express.json())
app.use(express.static('public'));

// Routes 
app.use('/api/files',fileRoute );

async function startserver() {
 await connect()
  app.listen(port, () =>
    console.log(`Example app listening on port ${port} !`),
  );
}

startserver()