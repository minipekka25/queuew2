const dbconnect =  require('./dbconnect')
const UserSchema = require('./Schemas/user')

const User = require("./DBhelpers/user");

const event = {
    returnValues:{
        user
            :
            "0x419DaEa16449508F284e8bFBF2709511c5ee3d98",
referrer
            :
            "0x2287340c8cF42b1E9F0A11eC3890Fd016C2E7F21",
matrix
            :
            "1",
level
            :
            "4"
    },
    event:'Upgrade',
    transactionHash:'0x6f6da48cac8223edaf02c2a969b085424185e6d221b7861a172a06dd473d26f3'
}

let createUser = async () =>{

    User.removeUpgradedUser(event)

}

createUser()



