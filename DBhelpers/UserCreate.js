const dbconnect = require("../dbconnect");
const userSchema = require("../Schemas/user");
const slottxnSchema = require("../Schemas/slottxn");
const x3matrixSchema = require("../Schemas/x3matrix");
const x6matrixSchema = require("../Schemas/x6matrix");
const TransactionSchema = require("../Schemas/transactions");
const slotholderSchema = require("../Schemas/slotholder");
const MatrixstatSchema =  require("../Schemas/matrixstat");
const txnlogSchema = require("../Schemas/txnlog");
const userstatSchema = require("../Schemas/userstat");

let mxdb = dbconnect.getDatabaseConnection("Matrix");

const user = mxdb.model("user", userSchema);
const x3matrix = mxdb.model("x3matrix", x3matrixSchema);
const x6matrix = mxdb.model("x6matrix", x6matrixSchema);
const Matrix = mxdb.model("matrixstat", MatrixstatSchema)
const txnstat = mxdb.model("txnlog", txnlogSchema)
const userstat = mxdb.model("userstat", userstatSchema)
const slottxn = mxdb.model("slottxn", slottxnSchema);






exports.UserCreate =  async (data) => {

    let referrerObj = await user.findOne({ id: data.returnValues.referrerId });
    let matObj = await Matrix.findOne({ide:'genesis'})
    let userstatObj = await userstat.findOne({ address: data.returnValues.user })
    let txnlogObj = await txnstat.findOne({ transactionId: data.transactionHash})

    try {
        let newx3matrix = new x3matrix({
            level: 1,
            reinvests: 0,
            genesistxn: data.transactionHash,
            soldspots: 0,
            slots: [],
            gift: 0,
            loss: 0,
            transactions: [],
            owner: data.returnValues.user
        });

        let newx6matrix = new x6matrix({
            level: 1,
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
            owner: data.returnValues.user
        });

        let newSlotTxn = new slottxn({
            transactionId: data.transactionHash,
            useraddress: 'null',
            referreraddress: data.returnValues.user,
            referrerid: Number(data.returnValues.userId),
            value: 0.025,
            level: 0,
            reinvest: 0,
            place: 0,
            matrix: 0,
            txntype: 'registered',
        });

        try {
            let createdx3 = await newx3matrix.save();
            let createdx6 = await newx6matrix.save();
            let createdtxn = await newSlotTxn.save();

            let newUser = new user({
                id: data.returnValues.userId,
                address: data.returnValues.user,
                referrer: referrerObj,
                partnersCount: 0,
                beneficiery: data.returnValues.user,
                genesistxn: data.transactionHash,
                x3active: [
                    true,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                ],
                x6active: [
                    true,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                ],
                x3count:1,
                x6count:1,
                partners: [],
                x3Matrix: [createdx3],
                x6Matrix: [createdx6],
                earningsTotal: 0,
                earnings3x: 0,
                earnings6x: 0,
                totalgift: 0,
                totalloss: 0,
                overtook: false,
                overtaken: [],
                transactions: [createdtxn],
            });

            

            try {
                let createdUser = await newUser.save();
                referrerObj.partnersCount++;
                referrerObj.partners.push(createdUser);
                if (matObj.newJoinees.length < 10) {
                    matObj.newJoinees.push(createdUser)
                }else if(matObj.newJoinees.length === 10){
                    matObj.newJoinees.shift()
                    matObj.newJoinees.push(createdUser)
                }
                if (Number(data.returnValues.userId) < 10){
                    matObj.topUsers.push(createdUser)
                }
                if (txnlogObj){
                    txnlogObj.status = 'processed'
                }
                if (userstatObj){
                    userstatObj.status = 'processed'
                }
                
                
                try {
                    await referrerObj.save();
                    await matObj.save();
                    if (txnlogObj) {
                        txnlogObj.save();
                    }
                    if (userstatObj) {
                        userstatObj.save();
                    }
                } catch (e) {
                    console.log(e);
                }
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    } catch (e) {
        console.log(e);
    }

}