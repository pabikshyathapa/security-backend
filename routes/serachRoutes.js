const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/serachController");

router.get("/", searchProducts); // Now just handles "/"

module.exports = router;
