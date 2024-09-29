const express = require("express");
const router = express.Router();
const Snippet = require("../models/snippetModel");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure this is the correct path to your auth middleware

// Save a new snippet
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, code, language } = req.body;
    const newSnippet = new Snippet({
      userId: req.user._id,
      title,
      code,
      language,
    });
    const savedSnippet = await newSnippet.save();
    res
      .status(201)
      .json({ message: "Snippet saved", success: true, snippet: savedSnippet });
  } catch (error) {
    console.error("Error saving snippet:", error);
    res.status(500).json({ message: "Error saving snippet", success: false });
  }
});

// Get all snippets for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({ userId: req.user._id });
    res.status(200).json({ success: true, snippets });
  } catch (error) {
    console.error("Error retrieving snippets:", error);
    res
      .status(500)
      .json({ message: "Error retrieving snippets", success: false });
  }
});

// Delete a snippet by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const snippetId = req.params.id;
    const deletedSnippet = await Snippet.findByIdAndDelete(snippetId);

    if (!deletedSnippet) {
      return res
        .status(404)
        .json({ message: "Snippet not found", success: false });
    }

    res.status(200).json({ message: "Snippet deleted", success: true });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    res.status(500).json({ message: "Error deleting snippet", success: false });
  }
});

module.exports = router;
