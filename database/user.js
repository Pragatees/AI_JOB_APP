const mongoose = require("mongoose");

const empSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const empmodel = mongoose.model("users", empSchema);
module.exports = empmodel;
