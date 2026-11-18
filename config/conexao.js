import mongoose from "mongoose";
//const url = "mongodb+srv://marcelosiedler:ifsul@ifsul.fify4.mongodb.net/"
const url = "mongodb+srv://caiomenna:123@cluster0.wg6idno.mongodb.net/?appName=Cluster0"
const conexao = await mongoose.connect(url)

export default conexao