const express = require("express");
const { fetchNoBgImage } = require("../lib/fetchNoBgImage");
const router = express.Router();

router.post("/", async (req, res, next) => {
    const { imageData } = req.body;
    if (!imageData)
        return res.status(400).json({ error: "Image Not Provided" });
    const result = await fetchNoBgImage(imageData);
    res.status(200).json({
        statusCode: 200,
        message: "Bg removal successful",
        data: { imageSrc: result },
    });
});

module.exports = router;
