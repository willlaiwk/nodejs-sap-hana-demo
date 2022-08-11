"use strict";
const util = require("util");
const hana = require("@sap/hana-client");
const Config = require("./config");

const connOptions = {
  serverNode: Config.SERVER_NODE,
  UID: Config.UID,
  PWD: Config.PWD,
  sslValidateCertificate: "false", //Must be set to false when connecting to an SAP HANA, express edition instance that uses a self-signed certificate.
};

//Asynchronous example calling a stored procedure with callbacks
const connection = hana.createConnection();

connection.connect(connOptions, function (err) {
  if (err) {
    return console.error(err);
  }
  //Prepared statement example
  const statement = connection.prepare(
    "SELECT * FROM HOTEL.CITY WHERE STATE=?;"
  );
  const parameters = ["CA"];
  const results = statement.execQuery(parameters, function (err, results) {
    if (err) {
      return console.error(err);
    }
    processResults(results, function (err) {
      if (err) {
        return console.error(err);
      }
      results.close(function (err) {
        if (err) {
          return console.error(err);
        }
        statement.drop(function (err) {
          if (err) {
            return console.error(err);
          }
          return connection.disconnect(function (err) {
            if (err) {
              return console.error(err);
            }
          });
        });
      });
    });
  });
});

function processResults(results, cb) {
  results.next(function (err, hasValues) {
    if (err) {
      return console.error(err);
    }
    if (hasValues) {
      results.getValues(function (err, row) {
        console.log(util.inspect(row, { colors: false }));
        processResults(results, cb);
      });
    } else {
      return cb();
    }
  });
}
