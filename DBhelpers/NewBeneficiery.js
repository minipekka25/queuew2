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
const Matrixstat = mxdb.model("matrixstat", MatrixstatSchema);
const txnstat = mxdb.model("txnlog", txnlogSchema);
const userstat = mxdb.model("userstat", userstatSchema);
const slottxn = mxdb.model("slottxn", slottxnSchema);
const Transactions = mxdb.model("transaction", TransactionSchema);
const slotholder = mxdb.model("slotholder", slotholderSchema);

const price = [0.025, 0.05, 0.075, 0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

exports.NewBeneficiery = async (data) => {

let founduser = user.findone({id:Number(data.returnValues.id)})

founduser.beneficiery = data.returnValues.newaddress

try{
    await founduser.save()
}catch(e){
    console.log(e)
}


}