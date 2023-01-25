const puppeteer = require("puppeteer");
const fs = require("fs");
const fetch = require("node-fetch")

const fetchNoBgImage = async (imageData) => {
    console.log(imageData);
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/chromium-browser',
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
        '--no-sandbox',
        '--disable-gpu',
        ]
    });

    const fileName = `${Date.now().toString()}Image`;
    // eslint-disable-next-line no-buffer-constructor
    const base64Image = imageData.split(";base64,").pop();

    const imagePath = `./tmp/${fileName}.png`;

    fs.writeFile(imagePath, base64Image, { encoding: "base64" }, (err) => {
        console.log(err);
        console.log("File created");
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");
        await page.goto("https://removal.ai/upload");
        console.log("opened removal.ai");
    
        // // wait for the file input element to be visible
        await page.waitForSelector('input[type="file"]');
        const inputUploadHandle = await page.$("input[type=file]");
        console.log("found upload button");
        inputUploadHandle.uploadFile(imagePath);
        console.log("uploaded file!");
    
        await page.waitForSelector("a[download]");
        console.log("found download button!");
        // // wait for the preview image to load
        await page.waitForFunction(() => {
            const link = document.querySelector("a[download]");
            return link !== null && link.href !== undefined && link.href !== "";
        });
        // get the preview image source
        const previewImageSrc = await page.evaluate(
            () => document.querySelector("a[download]").href
        );
    
        const imageUrlData = await fetch(previewImageSrc);
        const buffer = await imageUrlData.arrayBuffer();
        const stringifiedBuffer = Buffer.from(buffer).toString("base64");
        const contentType = imageUrlData.headers.get("content-type");
        const imageBase64 = `data:image/${contentType};base64,${stringifiedBuffer}`;
        // Close the browser
        await browser.close();    
        fs.unlinkSync(imagePath);
        console.log("File Deleted");
        return imageBase64;
    } catch (error) {
        fs.unlinkSync(imagePath);
        console.log("File Deleted");
        console.log(error);
    }
}

module.exports = {fetchNoBgImage};