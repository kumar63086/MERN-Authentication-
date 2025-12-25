import app from './app.js';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';

dotenv.config();


const Port = process.env.PORT || 3000;

app.listen(Port, () => {
    console.log(`Server is Running on ${Port}`);
    console.log("Swagger Docs → http://localhost:3000/api-docs");
    connectDB()
    
});
