const { PerformanceObserver, performance } = require("perf_hooks");
const util = require("util");
const hana = require("@sap/hana-client");
const Config = require("./config");

const connOptions = {
  serverNode: Config.SERVER_NODE,
  UID: Config.UID,
  PWD: Config.PWD,
  sslValidateCertificate: "false", //Must be set to false when connecting to an SAP HANA, express edition instance that uses a self-signed certificate.
};

//Synchronous  example querying a table
const connection = hana.createConnection();

connection.connect(connOptions);

const sql = "SELECT * FROM HOTEL.CITY;";
const t0 = performance.now();
const result = connection.exec(sql);
console.log(util.inspect(result, { colors: false }));
const t1 = performance.now();
console.log("time in ms " + (t1 - t0));
connection.disconnect();
