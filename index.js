
const express = require('express')
const app = express()
const Queue = require("bee-queue");

const queueConfig = require("./queue");


const UserCreate = require("./DBhelpers/UserCreate").UserCreate
const UserRemove = require("./DBhelpers/UserRemove").UserRemove
const UserUpgrade = require("./DBhelpers/UserUpgrade").UserUpgrade
const NewPlace = require("./DBhelpers/NewPlace").NewPlace
const NewReinvest = require("./DBhelpers/NewReinvest").NewReinvest
const NewGift = require("./DBhelpers/NewGift").NewGift
const NewLoss = require("./DBhelpers/NewLoss").NewLoss
const NewBeneficiery = require("./DBhelpers/NewBeneficiery").NewBeneficiery



const new_Reg_Upgrade = new Queue('new_Reg_Upgrade', queueConfig);
const new_place_reinvest = new Queue('new_place_reinvest', queueConfig);
const new_gft_loss_benechng = new Queue('new_gft_loss_benechng', queueConfig);






new_Reg_Upgrade.process(function (job, done) {
  console.log(`Processing job ${job.id}`);
      
    if(job.data.type === "NewRegistration"){
        UserCreate(job.data.event).then((data)=>{
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e)=>{
            console.log(e)
        })
    }

    if (job.data.type === "RevokeRegistration"){
        UserRemove(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

    if (job.data.type === "NewUpgrade") {
        UserUpgrade(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }
});



new_place_reinvest.process(function (job, done) {

    console.log(`Processing job ${job.id}`);

    if (job.data.type === "NewPlace") {
        NewPlace(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

    if (job.data.type === "NewReinvest") {
        NewReinvest(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

})

new_gft_loss_benechng.process(function (job, done) {

    console.log(`Processing job ${job.id}`);

    if (job.data.type === "MissedEthReceive") {
        NewLoss(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

    if (job.data.type === "SentExtraEthDividends") {
        NewGift(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

    if (job.data.type === "BeneficieryChanged") {
        NewBeneficiery(job.data.event).then((data) => {
            console.log('processing done for job' + job.id)
            return done(null, data)
        }).catch((e) => {
            console.log(e)
        })
    }

})

// RemoveRegistration.process(function (job, done) {
//     console.log(`Processing job ${job.id}`);

//     User.RemoveUser(job.data.id).then((data) => {
//         console.log(`Processing done for job `);
//         return done(null, data);
//     }).catch((e) => {
//         console.log(e);
//         return done(e, job);
//     })
// });


// NewUpgrade.process(function (job, done) {
//   console.log(`Processing job ${job.id}`);
    
//       User.upgradeUser(job.data.event).then((data)=>{
//           console.log(`Processing done for job`);
//           return done(null, data);
//       }).catch((e)=>{
//           console.log(e);
//           return done(e, job);
//       })
// });


// NewUserPlace.process(function (job, done) {
//     console.log(`Processing job ${job.id}`);

//     User.newUserPlace(job.data.event).then((data) => {
//         console.log(`Processing done for job`);
//         return done(null, data);
//     }).catch((e) => {
//         console.log(e);
//         return done(e, job);
//     })
// });





app.listen(process.env.PORT || 3007, () => {
    console.log(`Example app listening at http://localhost:${3007}`)
})