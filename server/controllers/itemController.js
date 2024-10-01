const {
  selectRecord,
  createTable,
  checkRecordExists,
  insertRecord,
} = require("../utils/sqlFunctions");
const { APIData, customResponse } = require("../utils/customResponse");
const { APIError, AppError } = require("../utils/customErrors");
const { uploadFile } = require("../middlewares/fileUpload");
const itemSchema = require("../schema/itemSchema");
const mysql = require("mysql");
const config = require("../db/config");
const { query } = require("express");
const pool = mysql.createPool(config);

const fetchItems = async (req, res, next) => {
  try {
    const itemData = await selectRecord("dish");
    APIData(itemData)(req, res);
  } catch (err) {
    next(new APIError("Data not Found", 200, false, null));
  }
};

const insertItems = async (req, res, next) => {
  const filesData = req.files;
  const imagesPath = filesData.map((data) => {
    return data.path;
  });

  console.log(imagesPath);

  const images_path = JSON.stringify(imagesPath);

  const {
    name,
    description,
    min_entries,
    max_entries,
    quantity,
    start_date,
    end_date,
    ticket_price,
  } = req.body;

  const item = {
    name,
    description,
    min_entries,
    max_entries,
    quantity,
    start_date,
    end_date,
    ticket_price,
    images_path,
  };

  try {
    await createTable(itemSchema);
    const itemAlreadyExists = await checkRecordExists("items", "name", name);
    if (itemAlreadyExists) {
      // res.status(409).json({
      //   error: "Try with some other name!",
      // });
      next(new AppError("Try with other name!", 409, false));
    } else {
      await insertRecord("items", item);
      // res.status(201).json({ message: "Item added successfully" });
      customResponse("Item added successfully!", 201)(req, res);
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  fetchItems,
  insertItems,
};
