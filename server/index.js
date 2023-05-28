
// kechat gpt lay first do pagination then fil
import  express from "express";
import dotenv from 'dotenv'
import  CONNECTDB  from "./config/db.js"
//import {imageroute } from './routes/imageroute.js'
import cors from "cors"
import router from "./route/neewsfeedroute.js";
import mdrouter from "./route/marketdata.js";
import jobrouter from "./route/jobroute.js";
dotenv.config();


const app=express();
app.use(express.json());

// we are telling this application will use only json to communicate
app.use(cors({
   origin: 'http://localhost:3001', // specify the URL of the client that can make requests
   methods: ['GET', 'POST','DELETE','PUT'], // specify the methods that are allowed
 }));
CONNECTDB();
const port=3000;


app.use('/',router)
app.use('/marketdata',mdrouter)
app.use('/jobs',jobrouter)

app.listen(port,MEL);

function MEL(){
    
        console.log(`bro running ${port}`);
}