const userSchema = require("../Schemas/user");
const slottxnSchema = require("../Schemas/slottxn");
const x3matrixSchema = require("../Schemas/x3matrix");
const x6matrixSchema = require("../Schemas/x6matrix");
const TransactionSchema = require("../Schemas/transactions");
const slotholderSchema = require("../Schemas/slotholder");
const MatrixstatSchema = require("../Schemas/matrixstat");
const txnlogSchema = require("../Schemas/txnlog");
const userstatSchema = require("../Schemas/userstat");

const dbconnect = require("../dbconnect");
let mxdb = dbconnect.getDatabaseConnection("Matrix");

const user = mxdb.model("user", userSchema);
const x3matrix = mxdb.model("x3matrix", x3matrixSchema);
const x6matrix = mxdb.model("x6matrix", x6matrixSchema);
const Matrix = mxdb.model("matrixstat", MatrixstatSchema);
const txnstat = mxdb.model("txnlog", txnlogSchema);
const userstat = mxdb.model("userstat", userstatSchema);
const Transactions = mxdb.model("transaction", TransactionSchema);
const slottxn = mxdb.model("slottxn", slottxnSchema);

const price = [0.025, 0.05, 0.075, 0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

exports.UserUpgrade = async (data) => {
  let foundUser = await user
    .findOne({ address: data.returnValues.user })
    .populate({ path: "referrer", model: user })
    .populate({ path: "overtaken", model: Transactions })
    .populate({ path: "partners", model: user });
  let referrer = await user.findOne({ address: foundUser.referrer.address });
    let txnObj = await txnstat.findOne({ transactionId: data.transactionHash });

    txnObj.status = 'processed'

  if (data.returnValues.matrix === "1") {
    foundUser.x3active.set(Number(data.returnValues.level) - 1, true);
    foundUser.x3count = Number(data.returnValues.level)

    let newx3matrix = new x3matrix({
      level: Number(data.returnValues.level),
      reinvests: 0,
      genesistxn: data.transactionHash,
      soldspots: 0,
      slots: [],
      gift: 0,
      loss: 0,
      transactions: [],
      owner:foundUser.address
    });

    let newSlotTxn = new slottxn({
      transactionId: data.transactionHash,
      useraddress: null,
      referreraddress: data.returnValues.user,
      referrerid: null,
      value: price[Number(data.returnValues.level) - 1],
      level: Number(data.returnValues.level),
      reinvest: 0,
      place: 0,
      matrix: data.returnValues.matrix,
      txntype: 'upgrade',
    });

    try {
      let createdx3 = await newx3matrix.save();
      let createdtxn = await newSlotTxn.save();
      foundUser.x3Matrix.set(Number(data.returnValues.level) - 1, createdx3);
      foundUser.transactions.push(createdtxn)
    } catch (e) {
      console.log(e);
    }

    if (referrer.x3active[Number(data.returnValues.level) - 1] !== true) {
      foundUser.overtook = true;

      let overtakenTxn = await Transactions.findOne({
        transactionId: data.transactionHash,
        eventName: data.event,
      });

      referrer.overtaken.push(overtakenTxn);
      try {
        await referrer.save();
      } catch (e) {
        console.log(e);
      }
    }
  } else if (data.returnValues.matrix === "2") {
    foundUser.x6active.set(Number(data.returnValues.level) - 1, true);
    foundUser.x6count = Number(data.returnValues.level)
    

    let newx6matrix = new x6matrix({
      level: Number(data.returnValues.level),
      reinvests: 0,
      soldspots: 0,
      genesistxn: data.transactionHash,
      slots: [],
      gift: 0,
      loss: 0,
      slippageup: 0,
      slippagedown: 0,
      slippagepartner: 0,
      transactions: [],
      owner: foundUser.address
    });

    let newSlotTxn = new slottxn({
      transactionId: data.transactionHash,
      useraddress: null,
      referreraddress: data.returnValues.user,
      referrerid: null,
      value: price[Number(data.returnValues.level) - 1],
      level: Number(data.returnValues.level),
      reinvest: 0,
      place: 0,
      matrix: data.returnValues.matrix,
      txntype: 'upgrade',
    });
    try {
      let createdx6 = await newx6matrix.save();
      let createdtxn = await newSlotTxn.save();
      foundUser.x6Matrix.set(Number(data.returnValues.level) - 1, createdx6);
      foundUser.transactions.push(createdtxn)
    } catch (e) {
      console.log(e);
    }
    if (referrer.x6active[Number(data.returnValues.level) - 1] !== true) {
      foundUser.overtook = true;
      let overtakenTxn = await Transactions.findOne({
        transactionId: data.transactionHash,
        eventName: data.event,
      });
      referrer.overtaken.push(overtakenTxn);
      try {
        await referrer.save();
      } catch (e) {
        console.log(e);
      }
    }
  }

  if (foundUser.overtaken.length > 0) {
    let filteredpartner = foundUser.overtaken.filter((i) => {
      return (
        i.dataLog.matrix === data.returnValues.matrix &&
        i.dataLog.level === data.returnValues.level
      );
    });

    if (filteredpartner.length > 0) {
      filteredpartner.map(async (i) => {
        let newfounduser = await user.findOne({ address: i.dataLog.user });
        if (data.returnValues.matrix === "1") {
          if (
            Number(data.returnValues.level) < 10 && newfounduser.x3active[Number(data.returnValues.level)] === false
          ) {
            newfounduser.overtook = false;
          } else if (Number(data.returnValues.level) === 10){
            newfounduser.overtook = false;
          }
        } else if (data.returnValues.matrix === "2") {
          if (
              Number(data.returnValues.level) < 10 && newfounduser.x6active[Number(data.returnValues.level)] === false
          ) {
            newfounduser.overtook = false;
          } else if (Number(data.returnValues.level) === 10){
              newfounduser.overtook = false;
          }
        }
        await newfounduser.save();
      });

      let overtakenmatrix = Array.from(foundUser.overtaken);

      overtakenmatrix.map((i) => {
        if (
          i.dataLog.matrix == data.returnValues.matrix &&
          i.dataLog.level == data.returnValues.level
        ) {
          foundUser.overtaken.pull({ _id: i._id });
        }
      });
      try {
        await foundUser.save();
      } catch (e) {
        console.log(e);
      }
    }
  } else {
    try {
      await foundUser.save();
      await txnObj.save();
    } catch (e) {
      console.log(e);
    }
  }
};
