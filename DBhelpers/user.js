const dbconnect = require("../dbconnect");
const userSchema = require("../Schemas/user");
const slottxnSchema = require("../Schemas/slottxn");
const x3matrixSchema = require("../Schemas/x3matrix");
const x6matrixSchema = require("../Schemas/x6matrix");
const TransactionSchema = require("../Schemas/transactions");
const slotholderSchema =  require("../Schemas/slotholder");

let mxdb = dbconnect.getDatabaseConnection("Matrix");

const user = mxdb.model("user", userSchema);
const x3matrix = mxdb.model("x3matrix", x3matrixSchema);
const x6matrix = mxdb.model("x6matrix", x6matrixSchema);
const slottxn = mxdb.model("slottxn", slottxnSchema);
const Transactions = mxdb.model("transaction", TransactionSchema);
const slotholder = mxdb.model("slotholder", slotholderSchema);

const price = [0.025, 0.05, 0.075, 0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

exports.createUser = async (data) => {
  let referrerObj = await user.findOne({ id: data.returnValues.referrerId });

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
    });

    try {
      let createdx3 = await newx3matrix.save();
      let createdx6 = await newx6matrix.save();

      let newUser = new user({
        id: data.returnValues.userId,
        address: data.returnValues.user,
        referrer: referrerObj,
        partnersCount: 0,
        beneficiery: data.returnValues.user,
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
        partners: [],
        x3Matrix: [createdx3],
        x6Matrix: [createdx6],
        earningsTotal: 0,
        earnings3x: 0,
        earnings6x: 0,
        gift: 0,
        loss: 0,
        overtook: false,
        overtaken: [],
        transactions: [],
      });

      try {
        let createdUser = await newUser.save();
        referrerObj.partnersCount++;
        referrerObj.partners.push(createdUser);
        try {
          await referrerObj.save();
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
};

exports.RemoveUser = async (id) => {
  try {
    let deleted = await user.deleteOne({ id: id });
  } catch (e) {
    console.log(deleted);
  }
};

exports.createOwner = async (data, txn) => {
  let createdx3 = [];
  let createdx6 = [];
  for (i = 1; i <= 10; i++) {
    let newx3matrix = new x3matrix({
      level: i,
      reinvests: 0,
      genesistxn: txn,
      soldspots: 0,
      slots: [],
      gift: 0,
      loss: 0,
      transactions: [],
    });

    let newx6matrix = new x6matrix({
      level: i,
      reinvests: 0,
      soldspots: 0,
      genesistxn: txn,
      slots: [],
      gift: 0,
      loss: 0,
      slippageup: 0,
      slippagedown: 0,
      slippagepartner: 0,
      transactions: [],
    });

    try {
      let created3 = await newx3matrix.save();
      let created6 = await newx6matrix.save();
      createdx3.push(created3);
      createdx6.push(created6);
    } catch (e) {
      console.log(e);
    }
  }

  try {
    let newUser = new user({
      id: 1,
      address: data,
      referrer: null,
      partnersCount: 0,
      beneficiery: data,
      x3active: [true, true, true, true, true, true, true, true, true, true],
      x6active: [true, true, true, true, true, true, true, true, true, true],
      partners: [],
      x3Matrix: createdx3,
      x6Matrix: createdx6,
      earningsTotal: 0,
      earnings3x: 0,
      earnings6x: 0,
      gift: 0,
      loss: 0,
      overtook: false,
      overtaken: [],
      transactions: [],
    });

    try {
      await newUser.save();
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.upgradeUser = async (data) => {
  let foundUser = await user
    .findOne({ address: data.returnValues.user })
    .populate({ path: "referrer", model: user })
    .populate({ path: "overtaken", model: Transactions })
    .populate({ path: "partners", model: user });
  let referrer = await user.findOne({ address: foundUser.referrer.address });

  if (data.returnValues.matrix === "1") {
    foundUser.x3active.set(Number(data.returnValues.level) - 1, true);

    let newx3matrix = new x3matrix({
      level: Number(data.returnValues.level),
      reinvests: 0,
      genesistxn: data.transactionHash,
      soldspots: 0,
      slots: [],
      gift: 0,
      loss: 0,
      transactions: [],
    });

    try {
      let createdx3 = await newx3matrix.save();
      foundUser.x3Matrix.set(Number(data.returnValues.level) - 1, createdx3);
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
    });
    try {
      let createdx6 = await newx6matrix.save();
      foundUser.x6Matrix.set(Number(data.returnValues.level) - 1, createdx6);
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
            if (newfounduser.x3active[Number(data.returnValues.level)] === false) {
            newfounduser.overtook = false;
          }
        } else if (data.returnValues.matrix === "2") {
            if (newfounduser.x6active[Number(data.returnValues.level)] === false) {
            newfounduser.overtook = false;
          }
        }
        await newfounduser.save();
      });

      let overtakenmatrix = Array.from(foundUser.overtaken)
        
      overtakenmatrix.map((i) => {
        if (i.dataLog.matrix == data.returnValues.matrix && i.dataLog.level == data.returnValues.level) {
          foundUser.overtaken.pull({ _id: i._id })
        }
      })
        try {
          await foundUser.save();
        } catch (e) {
          console.log(e);
        }
      
        


      
    }
  } else {
    try {
      await foundUser.save();
    } catch (e) {
      console.log(e);
    }
  }
};

exports.removeUpgradedUser = async (data) => {
    let foundUser = await user
        .findOne({ address: data.returnValues.user })
        .populate({ path: "referrer", model: user })
        .populate({ path: "overtaken", model: Transactions })
        .populate({ path: "partners", model: user, populate: [{ path: "x3Matrix", model: x3matrix} ,{path: "x6Matrix", model: x6matrix }]});
  let referrer = await user.findOne({ address: foundUser.referrer.address });
  
  foundUser.partners.length > 0 && foundUser.partners.map(async (i)=>{
      if (i.x3active[Number(data.returnValues.level) - 1] === true || i.x6active[Number(data.returnValues.level) - 1] === true){
          let overtakenTxn = Transactions.findOne({
              transactionId: data.returnValues.matrix === '1' ? i.x3Matrix[Number(data.returnValues.level) - 1].genesistxn : i.x6Matrix[Number(data.returnValues.level) - 1].genesistxn,
              eventName: data.event,
          });
          foundUser.overtaken.push(overtakenTxn)
          let partner = await user.findOne({address:i.address})
          partner.overtook = true
          await partner.save()
      } 
  })

  if(foundUser.overtook === true){

      if (referrer.x3active[Number(data.returnValues.level) - 2] === true || referrer.x6active[Number(data.returnValues.level) - 2] === true){
          foundUser.overtook = false
      }

      let overtakenTxn = Transactions.findOne({
          transactionId: data.transactionHash,
          eventName: data.event,
      });

    let overtakenmatrix = Array.from(referrer.overtaken)

    overtakenmatrix.map((i) => {
      if (i == overtakenTxn) {
        referrer.overtaken.pull({ _id: i._id })
      }
    })
  }

  if (data.returnValues.matrix === '1') {
      foundUser.x3active.set(Number(data.returnValues.level - 1),false) 
      foundUser.x3Matrix.set(Number(data.returnValues.level - 1),undefined)
  } else if (data.returnValues.matrix === '2') {
      foundUser.x6active.set(Number(data.returnValues.level - 1), false) 
      foundUser.x6Matrix.set(Number(data.returnValues.level - 1), undefined)
  }

  try {
    await referrer.save();
    await foundUser.save();
    console.log('done')
  } catch (e) {
    console.log(e);
  }
};

exports.newUserPlace = async (data) => {
 
  let txntype;
  let slippageup = 0;
  let slippagedown = 0;
  let slippagepartner = 0;

  let ispartner 

  let userobj = await user
    .findOne({ address: data.returnValues.referrer })
    .populate({ path: "x3Matrix", model: x3matrix })
    .populate({ path: "x6Matrix", model: x6matrix })

  let referrer = await user.findOne({address:data.returnValues.user})


    if (await userobj.partners.includes(referrer._id)) {
      ispartner = true
    } else {
      ispartner = false
    } 
  
  if (data.returnValues.matrix === '1') {
    if (Number(data.returnValues.place) < 3) {
      txntype = "soldplace";
    } else {
      txntype = "reinvest";
    }
  } else if (data.returnValues.matrix === '2') {
    if (data.returnValues.place === '1' || data.returnValues.place === '2') {
      if (ispartner) {
        txntype = "slippagepartner";
        slippagepartner++;
      } else {
        txntype = "slippagepartner|slippageup";
        slippagepartner++;
        slippageup++;
      }
    } else if (
      data.returnValues.place === '3' ||
      data.returnValues.place === '4' ||
      data.returnValues.place === '5'
    ) {
      if (ispartner) {
        txntype = "soldplace";
      } else {
        txntype = "soldplace|slippagedown";
        slippagedown++;
      }
    } else if (data.returnValues.place === '6') {
      if (ispartner) {
        txntype = "reinvest";
      } else {
        txntype = "reinvest|slippagedown";
        slippagedown++;
      }
    }
  }

  let newSlotTxn = new slottxn({
    transactionId: data.transactionHash,
    useraddress: data.returnValues.referrer,
    referreraddress: data.returnValues.user,
    value: price[Number(data.returnValues.level) - 1],
    level: Number(data.returnValues.level),
    reinvest: Number(data.returnValues.count),
    place: Number(data.returnValues.place),
    matrix: data.returnValues.matrix,
    txntype: txntype,
  });

  try {
    let createdSltTxn = await newSlotTxn.save();

    let slothold = await slotholder.findOne({user:data.returnValues.referrer, matrix:data.returnValues.matrix, level:data.returnValues.level, reinvest:data.returnValues.count})

    let slotplace

    if (slothold){
      slothold.slotholder.push(createdSltTxn)
      try{
       slotplace = await slothold.save()
      } catch(e){
        console.log(e)
      }
    }else{
      let newslotholder = new slotholder({
        user: data.returnValues.referrer,
        level: data.returnValues.level,
        matrix: data.returnValues.matrix,
        reinvest: data.returnValues.count,
        slotholder: [createdSltTxn]
      })
      try{
      slotplace =  await newslotholder.save()
      }catch(e){
        console.log(e)
      }
    }

    if (data.returnValues.matrix === '1') {
      let x3levelarr = await x3matrix.findOne({ _id: userobj.x3Matrix[Number(data.returnValues.level) - 1]._id}) 
      x3levelarr.slots.set(data.returnValues.count,slotplace)
      x3levelarr.soldspots++;
      x3levelarr.transactions.push(createdSltTxn)
      try{
        await x3levelarr.save()
      }catch(e){
        console.log(e)
      }
    } else if (data.returnValues.matrix === '2') {
      let x6levelarr = await x6matrix.findOne({ _id: userobj.x6Matrix[Number(data.returnValues.level) - 1]._id}) 
      
      x6levelarr.slots.set(data.returnValues.count, slotplace)
      x6levelarr.soldspots++;
      x6levelarr.slippagepartner = slippagepartner;
      x6levelarr.slippageup = slippageup;
      x6levelarr.slippagedown = slippagedown;
      x6levelarr.transactions.push(createdSltTxn);
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

    await userobj.save();
  } catch (e) {
    console.log(e);
  }
};
