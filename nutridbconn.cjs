   
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "mongodb://localhost/nutribyte";

try {
    mongoose.connect(uri);
    console.log("Connected to Mongodb");
} catch (e) {
    console.log(e)
    console.log("Mongodb connection failed")
}

module.exports =  mongoose;