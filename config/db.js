import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config()
module.exports = {
  connect: () => connect(),
  mongoType: () => mongoose.Types,
  startSession: () => startSession()
};

async function connect() {
  const atlasUri = process.env.MONGO_CONNECTION_URL;
  if (mongoose.connection.readyState === 0) {
    return await mongoose.connect(atlasUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify : true,
      useCreateIndex:true
    },(err)=>{
      if(err) console.log("conection to Db error ", err);
      else console.log("coented");
    });
  } else return true;
}
async function startSession() {
  return await mongoose.startSession();
}


// mIAY0a6u1ByJsWWZ
