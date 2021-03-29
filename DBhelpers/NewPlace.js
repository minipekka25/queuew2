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


exports.NewPlace = async (data) =>{
    let txntype;
    let slippageup = 0;
    let slippagedown = 0;
    let slippagepartner = 0;

    await user
        .findOne({ address: data.returnValues.referrer })
        .populate({ path: "x3Matrix", model: x3matrix })
        .populate({ path: "x6Matrix", model: x6matrix }).exec((e, response)=> {if (e){
            console.log(e)
        }else{
         
            runSlot(response)
            console.log('new place' + data.returnValues.place)

        }})
    

    if (data.returnValues.matrix === '1') {
        if (Number(data.returnValues.place) < 3) {
            txntype = "soldplace";
        } else {
            txntype = "reinvest";
        }
    } else if (data.returnValues.matrix === '2') {
        if (data.returnValues.place === '1' || data.returnValues.place === '2') {
            if (data.returnValues.ispartner === true) {
                txntype = "slippagesuperior|slippagezero";
                slippagepartner++;
            } else {
                txntype = "slippagesuperior|slippageup";
                slippagepartner++;
                slippageup++;
            }
        } else if (
            data.returnValues.place === '3' ||
            data.returnValues.place === '4' ||
            data.returnValues.place === '5'
        ) {
            if (data.returnValues.ispartner === true) {
                txntype = "soldplace|slippagezero";
            } else {
                txntype = "soldplace|slippagedown";
                slippagedown++;
            }
        } else if (data.returnValues.place === '6') {
            if (data.returnValues.ispartner === true) {
                txntype = "reinvest|slippagezero";
            } else {
                txntype = "reinvest|slippagedown";
                slippagedown++;
            }
        }
    }

    

    runSlot= async (respdata)=>{
        try {
            let newSlotTxn = new slottxn({
                transactionId: data.transactionHash,
                useraddress: data.returnValues.referrer,
                referreraddress: data.returnValues.user,
                referrerid: Number(data.returnValues.id),
                value: price[Number(data.returnValues.level) - 1],
                level: Number(data.returnValues.level),
                reinvest: Number(data.returnValues.count),
                place: Number(data.returnValues.place),
                matrix: data.returnValues.matrix,
                txntype: txntype,
            });
            
            let createdSltTxn = await newSlotTxn.save();

            let slothold = await slotholder.findOne({ user: data.returnValues.referrer, matrix: data.returnValues.matrix, level: data.returnValues.level, reinvest: data.returnValues.count })

            let slotplace

            if (slothold) {
                slothold.slotholder.push(createdSltTxn)
                try {
                    slotplace = await slothold.save()
                } catch (e) {
                    console.log(e)
                }
            } else {
                let newslotholder = new slotholder({
                    user: data.returnValues.referrer,
                    level: data.returnValues.level,
                    matrix: data.returnValues.matrix,
                    reinvest: data.returnValues.count,
                    slotholder: [createdSltTxn]
                })
                try {
                    slotplace = await newslotholder.save()
                } catch (e) {
                    console.log(e)
                }
            }

            

            if (data.returnValues.matrix === '1') {
                let x3levelarr = await x3matrix.findOne({ _id: await respdata.x3Matrix[Number(data.returnValues.level) - 1]._id })
                x3levelarr.slots.set(data.returnValues.count, slotplace)
                x3levelarr.soldspots++;
                x3levelarr.transactions.push(createdSltTxn)
                respdata.transactions.push(createdSltTxn)
                await user.findOneAndUpdate({ address: data.returnValues.referrer }, { $inc: { 'earnings3x': price[Number(data.returnValues.level) - 1], 'earningsTotal': price[Number(data.returnValues.level) - 1] } }).exec((e, r) => { if (e) { console.log(e) } })
                try {
                    await x3levelarr.save()
                } catch (e) {
                    console.log(e)
                }
            } else if (data.returnValues.matrix === '2') {
                let x6levelarr = await x6matrix.findOne({ _id: await respdata.x6Matrix[Number(data.returnValues.level) - 1]._id })

                x6levelarr.slots.set(data.returnValues.count, slotplace)
                x6levelarr.soldspots++;
                x6levelarr.slippagepartner += slippagepartner;
                x6levelarr.slippageup += slippageup;
                x6levelarr.slippagedown += slippagedown;
                x6levelarr.transactions.push(createdSltTxn);
                respdata.transactions.push(createdSltTxn)
                await user.findOneAndUpdate({ address: data.returnValues.referrer }, { $inc: { 'earnings6x': price[Number(data.returnValues.level) - 1], 'earningsTotal': price[Number(data.returnValues.level) - 1] } }).exec((e, r) => { if (e) { console.log(e) } })

                try {
                    await x6levelarr.save()
                } catch (e) {
                    console.log(e)
                }
            }

            

        

        } catch (e) {
            console.log(e);
        }

        try {
            
                await respdata.save();
            
        } catch (e) {
            console.log(e);
        }
    }

    
}
