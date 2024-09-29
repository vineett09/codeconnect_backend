const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Snippet = mongoose.model("Snippet", snippetSchema);
module.exports = Snippet;
