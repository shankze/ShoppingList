
const dynamoHelper = require("../helpers/dynamohelper")
const responseHelper = require("../helpers/responsehelper")
const jwt = require('jsonwebtoken')
const ssmHelper = require('../helpers/ssmhelper')
//const uuidv4 = require("uuidv4")
const {v4:uuidv4} = require('uuid')

let items = [
  {name:"Onion", section:"Indian",status:false,user:'aaa'},
  {name:"Tomato", section:"Indian",status:false,user:'aaa'},
  {name:"Peanuts", section:"Indian",status:false,user:'aaa'},
]

const itemsTableName = process.env.itemsTableName;
const listsTableName = process.env.listsTableName;
const userListsTableName = process.env.userListsTableName;

const handler = async (event) => {
  console.log(event)
  const authHeader = event.headers['Authorization']
  const token = authHeader && authHeader.split(' ')[1]  
  if(token==null){
    return responseHelper._401({message:"Unauthorized "})
  }
  let userInfo;
  try{
    const accessTokenSecret = await ssmHelper.getParameterFromParameterStore('SL_ACCESS_TOKEN_SECRET')
    userInfo = jwt.verify(token, accessTokenSecret)
  }catch(ex){
    return responseHelper._403({message:'Forbidden'})
  }
  const userName = userInfo.userName

  if(event.path === "/additem")
  {
    return await addListItem(event.body, userName)
  }
  if(event.path === "/items")
  {
    const lists = await getListsAssociatedWithUser(userName)
    if(lists.length == 0){
      return responseHelper._200({Responses:{'sl-lists':[]}})
    }
    return await getLists(event.body, lists)
  }
  if(event.path === "/sharelist")
  {
    return await shareList(event.body, userName)
  }
  if(event.path === "/createlist")
  {
    return await createlist(event.body, userName)
  }
  if(event.path === "/deletelist")
  {
    return await deleteList(event.body,userName)
  }
  if(event.path === "/clearlist")
  {
    return await clearList(event.body)
  }
}

const clearList = async (body) => {
  const newItemInfo = JSON.parse(body)
  const listId = newItemInfo.listId
  const currentTime = new Date()
  const params = {
    TableName: listsTableName,
    Key: { id: listId, },
    UpdateExpression: "set items = :itemsvalue, updateTime= :updateTime",
    ExpressionAttributeValues: {
      ":itemsvalue": [],
      ":updateTime": currentTime.toString(),
    },
    ReturnValues: "NONE"
  };
  try{
    await dynamoHelper.update(params);
    return responseHelper._200({message:"Success", status:true})
  }
  catch(exception){
    console.error(exception)
    return responseHelper._200({message:"An error occured while clearing list", status:false})
  }
  
}

const deleteList = async (body,userName) => {
  const newItemInfo = JSON.parse(body)
  const listId = newItemInfo.listId
  const listInfo = await getListById(listId)
  if(userName != listInfo['admin']){
    return responseHelper._200({message:"User does not have permissions to delete this list", status:false})
  }
  const currentTime = new Date()
  const params = {
    TableName: listsTableName,
    Key: { id: listId, },
    UpdateExpression: "set active = :activevalue, updateTime= :updateTime",
    ExpressionAttributeValues: {
      ":listsvalue": false,
      ":updateTime": currentTime.toString(),
    },
    ReturnValues: "NONE"
  };
  try{
    await dynamoHelper.update(params);
    return responseHelper._200({message:"Success", status:true})
  }
  catch(exception){
    console.error(exception)
    return responseHelper._500({message:"An error occured while clearing list", status:false})
  }
}

const createlist = async (body, userName) => {
  const newItemInfo = JSON.parse(body)
  const listName = newItemInfo.listName
  let currentTime = new Date();
  listId = uuidv4()
  try {
      await dynamoHelper.write({ active:true,admin:userName,id:listId,items:[],name:listName,updateTime:currentTime.toString() }, listsTableName)
      const userListQueryResponse = await dynamoHelper.get({ 'userName': userName }, userListsTableName)
      if (userListQueryResponse === null) {
        await dynamoHelper.write({ userName: userName, lists: [listId] }, userListsTableName)
      }
      else{
        let userlist = userListQueryResponse.lists
        userlist.push(listId)
        const params = {
          TableName: userListsTableName,
          Key: { userName: userName, },
          UpdateExpression: "set lists = :listsvalue",
          ExpressionAttributeValues: {
            ":listsvalue": userlist,
          },
          ReturnValues: "NONE"
        };
        await dynamoHelper.update(params);
      }
      return responseHelper._200({message:"Success", status:true,listId:listId})
    }
    catch(exception){
      console.error('Exception when creating list ' + listName)
      console.error(exception)
      return responseHelper._500({message:"An exception occured when creating the list", status:false})
    }
}

const shareList = async (body, userName) => {
  const newItemInfo = JSON.parse(body)
  const listId = newItemInfo.listId
  const listInfo = await getListById(listId)
  if(userName != listInfo['admin']){
    return responseHelper._200({message:"User does not have permissions to share this list", status:false})
  }
  const email = newItemInfo.email
  const userListQueryResponse = await dynamoHelper.get({ 'userName': email }, userListsTableName)
  try {
    if (userListQueryResponse === null) {
      await dynamoHelper.write({ userName: email, lists: [listId] }, userListsTableName)
    }
    else {
      let userlist = userListQueryResponse.lists
      if (!userlist.includes(listId)) {
        userlist.push(listId)
        const params = {
          TableName: userListsTableName,
          Key: { userName: email, },
          UpdateExpression: "set lists = :listsvalue",
          ExpressionAttributeValues: {
            ":listsvalue": userlist,
          },
          ReturnValues: "NONE"
        };
        await dynamoHelper.update(params);
      } else{
        //Uses has access to the list. Do nothing
      }
    }
    return responseHelper._200({message:'Success',status:true})
  }
  catch (exception) {
    return responseHelper._500({message:'There was an error',status:false})
  }
} 

const getListsAssociatedWithUser = async (userName) => {
  console.log('Getting lists associated with user:')
  const listsResponse = await dynamoHelper.getItemsQuery(userName,userListsTableName)
  console.log('Lists associated with user: ',listsResponse)
  listIds = []
  listsResponse.forEach(element => {
    listIds =  listIds.concat(element['lists'])
  })
  return listIds
}

const getListById = async (listId) => {
  const list = await dynamoHelper.get({id:listId},listsTableName)
  return list
}

const getLists = async (body, listIds) => {
  const listsBatchGetResponse = await dynamoHelper.batchGet(listIds,listsTableName)
  console.log(listsBatchGetResponse)
  console.log('Lists returned: ',listsBatchGetResponse)
  if(!listsBatchGetResponse){
    return responseHelper._400({message:"There was an error getting lists"})
  }
  const activeLists = listsBatchGetResponse['Responses']['sl-lists'].filter((list) => {
    return list.active === true
  })
  return responseHelper._200(activeLists)
}

const addListItem = async(body, userName)=>{
  const newItemInfo = JSON.parse(body)
  const newItem = newItemInfo.item
  const listId = newItemInfo.listId
  //const item = {userName, itemName, itemStatus, itemCategory}
  try {
    let list = await dynamoHelper.get({'id':listId},listsTableName)
    list['items'].push(newItem)
    console.log('List after adding new item: ', list)
    let currentTime = new Date();
    const params = {
      TableName: listsTableName,
      Key: { id:listId, },
      UpdateExpression: "set #it = :itemsList,  updateTime= :updateTime",
      ExpressionAttributeNames:{
        "#it": "items",  //items is reserved
      },
      ExpressionAttributeValues: {
        ":itemsList": list.items,
        ":updateTime": currentTime.toString(),
      },
      ReturnValues: "ALL_NEW"
    };
    const updateResponse = await dynamoHelper.update(params)
    console.log('After Update')
    console.log(updateResponse)
    return responseHelper._200({message:"Success", list})
  }
  catch(ex){
    console.error(ex)
    return responseHelper._500({message:ex})
  }
}

/*const getItems = async (body, userName) => {
  const user = JSON.parse(body)
  //const userName = user.userName
  const items = await dynamoHelper.getItemsQuery(userName,itemsTableName)
  if(!items){
    return responseHelper._400({message:"There was an error getting items"})
  }
  return responseHelper._200(items)
}*/

module.exports = {
  handler,
}