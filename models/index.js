"use strict";

const fs = require("fs");
const path = require("path");

const cls = require("continuation-local-storage");
const namespace = cls.createNamespace("sequelize-transaction");

const Sequelize = require("sequelize");
Sequelize.useCLS(namespace);

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.json").database[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

// load all models in db object
fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach(file => {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });


Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;