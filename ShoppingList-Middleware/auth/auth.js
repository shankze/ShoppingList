const bcrypt = require('bcryptjs')
const dynamoHelper = require("../helpers/dynamohelper")
const responseHelper = require("../helpers/responsehelper")
const jwt = require('jsonwebtoken')
const ssmHelper = require('../helpers/ssmhelper')

const userTableName = process.env.userTableName;
const refreshTokensTableName = process.env.refreshTokensTableName;

module.exports.login = async (event) => {
    const loginInfo = JSON.parse(event.body)
    const userName = loginInfo.userName
    const password = loginInfo.password 
    const userInfo = await dynamoHelper.getIfExists(userName,userTableName)
    if(userInfo == null){
        return responseHelper._400({message:"Cannot find user"})
    }
    else {
        try{
            if(await bcrypt.compare(password, userInfo.password)){
                const user = {userName:userName}
                const accessToken = await generateAccessToken(user)
                const refreshToken = await generateRefreshToken(user)
                return responseHelper._200({message:"Success", user:userInfo.userName,accessToken:accessToken, refreshToken})
            }
            else {
                return responseHelper._200({message:"Not Allowed - Incorrect Credentials", user:null,accessToken:null})
            }
        }catch(ex){
            return responseHelper._500({message:ex})
        }
    }
    
    return responseHelper._200(items) 

  }

async function generateAccessToken(user){
    const accessTokenSecret = await ssmHelper.getParameterFromParameterStore('SL_ACCESS_TOKEN_SECRET')
    return  jwt.sign(user, accessTokenSecret)
    //return  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'60s'})
}

async function generateRefreshToken(user){
    const refreshTokenSecret = await ssmHelper.getParameterFromParameterStore('SL_REFRESH_TOKEN_SECRET')
    let refreshToken =   jwt.sign(user, refreshTokenSecret,{expiresIn:'3d'})
    let dateTimeNow = new Date();
    const refreshTokenItem = {refreshToken,created:dateTimeNow.toString()}
    try {
      const newItem = await dynamoHelper.write(refreshTokenItem,refreshTokensTableName)
      if(newItem){
        return refreshToken
      }
      else {
        console.error('Error when generating refresh token')
        return null
      }
    }
    catch(ex){
      console.error(ex)
      return null
    }
}


module.exports.signup = async (event) => {
    const signupInfo = JSON.parse(event.body)
    const userName = signupInfo.userName
    const password = signupInfo.password 
    const email = signupInfo.email
    const hashedPassword = await bcrypt.hash(password,10)
    const user = {userName, password: hashedPassword, email}
    const newUser = await dynamoHelper.write(user,userTableName)
    return responseHelper._200({message:"Success"})
}

module.exports.logout = async (event) => {
    const logoutObject = JSON.parse(event.body)
    const refreshToken = logoutObject.refreshToken
    try{
        const response = await dynamoHelper.delete(refreshToken,refreshTokensTableName)
    }
    catch(ex){
        return responseHelper._500({message:ex.message})
    }
    return responseHelper._200({message:"Success"})
}