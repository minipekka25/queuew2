const x3matrixSchema = require("../Schemas/x3matrix");
const x6matrixSchema = require("../Schemas/x6matrix");


const dbconnect = require("../dbconnect");
let mxdb = dbconnect.getDatabaseConnection("Matrix");


const x3matrix = mxdb.model("x3matrix", x3matrixSchema);
const x6matrix = mxdb.model("x6matrix", x6matrixSchema);



exports.NewReinvest = async (data) =>{

    if (data.returnValues.matrix === '1'){

        let foundX3 = await x3matrix.findOne({ owner: data.returnValues.user, level: Number(data.returnValues.level)})

        foundX3.reinvests = Number(data.returnValues.count)

        try{
            foundX3.save()
        }catch(e){
            console.log(e)
        }
    } else if (data.returnValues.matrix === '2'){
        let foundX6 = await x6matrix.findOne({ owner: data.returnValues.user, level: Number(data.returnValues.level) })

        foundX6.reinvests = Number(data.returnValues.count)

        try {
            foundX6.save()
        } catch (e) {
            console.log(e)
        }
    }

}