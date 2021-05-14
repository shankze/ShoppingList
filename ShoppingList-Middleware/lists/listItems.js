
const dynamoHelper = require("../helpers/dynamohelper")
const responseHelper = require("../helpers/responsehelper")
const jwt = require('jsonwebtoken')

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
    userInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
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
    console.log(lists);
    //return await getItems(event.body, userName)
    return await getLists(event.body, lists)
  }
  if(event.path === "/sharelist")
  {
    return await shareList(event.body, userName)
  }
}

const shareList = async (body, userName) => {
  const newItemInfo = JSON.parse(body)
  const listId = newItemInfo.listId
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
  const listsResponse = await dynamoHelper.getItemsQuery(userName,userListsTableName)
  listIds = []
  listsResponse.forEach(element => {
    listIds =  listIds.concat(element['lists'])
  })
  return listIds
}

const getLists = async (body, lists) => {
  const items = await dynamoHelper.batchGet(lists,listsTableName)
  if(!items){
    return responseHelper._400({message:"There was an error getting items"})
  }
  return responseHelper._200(items)
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