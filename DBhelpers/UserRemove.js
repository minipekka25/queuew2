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
const Matrix = mxdb.model("matrixstat", MatrixstatSchema)
const txnstat = mxdb.model("txnlog", txnlogSchema)
const userstat = mxdb.model("userstat", userstatSchema)


exports.UserRemove = async (data) =>{
    let userObj = await user.findOne({ id: data.returnValues.userId });
    let matObj = await Matrix.findOne({ ide: 'genesis' })
    let userstatObj = await userstat.findOne({ address: data.returnValues.user })
    let txnlogObj = await txnstat.findOne({ transactionId: data.transactionHash })

    if(matObj.newJoinees.includes(userObj._id)){
        let idx = matObj.newJoinees.indexOf(userObj._id)
        matObj.newJoinees.splice(idx, 1);
        await matObj.save();
    }

    userstatObj.status = 'revoked'
    txnlogObj.status = 'revoked'

    try {
         await user.deleteOne({ id: data.returnValues.userId });
         await userstatObj.save();
         await txnlogObj.save();
        await x6matrix.deleteOne({ owner: data.returnValues.user });
        await x3matrix.deleteOne({ owner: data.returnValues.user });
    } catch (e) {
        console.log(e);
    }
}