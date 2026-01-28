
const mongoose = require("mongoose")
const dotenv=require('dotenv')
dotenv.config()
const CONNECTION_STRING = process.env.MONGODB_URI
console.log(process.env)
const connectDB = async () => {
    try{
        await mongoose.connect(
            CONNECTION_STRING,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
    }catch(err){
        console.log("DB Err" , err)
    }
}
module.exports = connectDB

