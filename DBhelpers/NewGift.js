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


exports.NewGift = async (data) =>{

    if (data.returnValues.matrix === '1') {
        let foundX3 = await x3matrix.findOne({ owner: data.returnValues.receiver, level: Number(data.returnValues.level) })
       

        foundX3.gift += price[Number(data.returnValues.level - 1)]
        await user.findOneAndUpdate({ address: data.returnValues.receiver }, { $inc: { 'totalgift': price[Number(data.returnValues.level - 1)] } }).exec((e, r) => { if (e) { console.log(e) } })

        let newSlotTxn = new slottxn({
            transactionId: data.transactionHash,
            useraddress: data.returnValues.receiver,
            referreraddress: data.returnValues.from,
            referrerid: Number(data.returnValues.id),
            value: price[Number(data.returnValues.level) - 1],
            level: Number(data.returnValues.level),
            reinvest: Number(data.returnValues.count),
            place: 0,
            matrix: data.returnValues.matrix,
            txntype: 'gift',
        });
        

        try {
            let createdslttxn = await newSlotTxn.save()
            foundX3.transactions.push(createdslttxn)
            await user.findOneAndUpdate({ address: data.returnValues.receiver }, { $inc: { 'earnings3x': price[Number(data.returnValues.level) - 1], 'earningsTotal': price[Number(data.returnValues.level) - 1] } }).exec((e, r) => { if (e) { console.log(e) } })

            try {
                await foundX3.save()
              
            } catch (e) {
                console.log(e)
            }
        } catch (e) {
            console.log(e)
        }



    }

    if (data.returnValues.matrix === '2') {
        let foundX6 = await x6matrix.findOne({ owner: data.returnValues.receiver, level: Number(data.returnValues.level) })
       

        foundX6.gift += price[Number(data.returnValues.level - 1)]
        await user.findOneAndUpdate({ address: data.returnValues.receiver }, { $inc: { 'totalgift': price[Number(data.returnValues.level - 1)] } }).exec((e, r) => { if (e) { console.log(e) } })


        let newSlotTxn = new slottxn({
            transactionId: data.transactionHash,
            useraddress: data.returnValues.receiver,
            referreraddress:  data.returnValues.from,
            referrerid: Number(data.returnValues.id),
            value: price[Number(data.returnValues.level) - 1],
            level: Number(data.returnValues.level),
            reinvest: Number(data.returnValues.count),
            place: 0,
            matrix: data.returnValues.matrix,
            txntype: 'gift',
        });
        try {
            let createdslttxn = await newSlotTxn.save()
            foundX6.transactions.push(createdslttxn)
            await user.findOneAndUpdate({ address: data.returnValues.receiver }, { $inc: { 'earnings6x': price[Number(data.returnValues.level) - 1], 'earningsTotal': price[Number(data.returnValues.level) - 1] } }).exec((e, r) => { if (e) { console.log(e) } })

            try {
                await foundX6.save()
               
            } catch (e) {
                console.log(e)
            }
        } catch (e) {
            console.log(e)
        }


    }

}