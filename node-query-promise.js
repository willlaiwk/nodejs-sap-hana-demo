"use strict";
const util = require("util");
const hana = require("@sap/hana-client");
const PromiseModule = require("@sap/hana-client/extension/Promise.js");
const Config = require("./config");

const connOptions = {
  serverNode: Config.SERVER_NODE,
  UID: Config.UID,
  PWD: Config.PWD,
  sslValidateCertificate: "false", //Must be set to false when connecting to an SAP HANA, express edition instance that uses a self-signed certificate.
};

//Asynchronous example calling a stored procedure that uses the promise module
const connection = hana.createConnection();
let statement;

PromiseModule.connect(connection, connOptions)
  .then(() => {
    //Prepared statement example
    return PromiseModule.prepare(
      connection,
      "SELECT * FROM HOTEL.CITY WHERE STATE=?;"
    );
  })
  .then((stmt) => {
    statement = stmt;
    const parameters = ["CA"];
    return PromiseModule.executeQuery(stmt, parameters);
  })
  .then((results) => {
    return processResults(results);
  })
  .then((results) => {
    return PromiseModule.close(results);
  })
  .then(() => {
    PromiseModule.drop(statement);
  })
  .then(() => {
    PromiseModule.disconnect(connection);
  })
  .catch((err) => {
    console.error(err);
  });

function processResults(results) {
  return new Promise((resolve, reject) => {
    let done = false;
    PromiseModule.next(results)
      .then((hasValues) => {
        if (hasValues) {
          return PromiseModule.getValues(results);
        } else {
          done = true;
        }
      })
      .then((values) => {
        if (done) {
          resolve(results);
        } else {
          console.log(util.inspect(values, { colors: false }));
          return processResults(results);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}
