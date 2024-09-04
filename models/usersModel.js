require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    // useCreateIndex: true
});

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
});

const connected = mongoose.model("User", schema);

exports.connected = connected