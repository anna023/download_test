// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const csv = require("csv-parser");
import XLSX from "xlsx";
import { name } from "../playwright.config";
const { deleteFile } = require("./helpers/helper");

test("csv file isn't empty", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/download");

  const downloadPromise = page.waitForEvent("download");
  await page.getByText("Write Excel Testdata2").click();

  const download = await downloadPromise;
  const path = `./downloads/${download.suggestedFilename()}`;
  await download.saveAs(path);
  const result = [];
  await fs
    .createReadStream(path)
    .pipe(csv())
    .on("data", (data) => result.push(data))
    .on("end", () => {
      console.log(result);
      expect(result.length).toBeGreaterThan(5);
      deleteFile(path);
    });
});

test("xlsx file test", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/download");

  const downloadPromise = page.waitForEvent("download");
  await page.getByText("Write Excel Testdata1").click();
  const download = await downloadPromise;
  const path = `./downloads/${download.suggestedFilename()}`;
  await download.saveAs(path);

  const parse = (path) => {
    const excelData = XLSX.readFile(path);
    return Object.keys(excelData.Sheets).map((name) => ({
      name,
      data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
    }));
  };
  parse(path).forEach((element) => {
    console.log(element.data);
    expect(element.data).toEqual([]);
  });
  deleteFile(path);
});

test("json file test", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/download");

  const downloadPromise = page.waitForEvent("download");
  await page.locator('//a[contains(text(),"example")]').click();
  const download = await downloadPromise;
  const path = `./downloads/${download.suggestedFilename()}`;
  await download.saveAs(path);

  const data = fs.readFileSync(path, {encoding : 'utf8'})
  let dataObj = JSON.parse(data);
  console.log(dataObj.name)
  await expect(dataObj.name).toContain('Using fixtures to represent data')
  deleteFile(path)
});