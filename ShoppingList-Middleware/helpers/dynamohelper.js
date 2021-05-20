const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-east-1' });

const documentClient = new AWS.DynamoDB.DocumentClient();

const Dynamo = {
  async get(key, TableName) {
    const params = {
      TableName,
      Key: key,
    };
    const data = await documentClient.get(params).promise();
    console.log(data)
    if (data.Item){
      return data.Item;
    }
    else{
      return null
    }
  },
  async delete(id, TableName) {
    const params = {
      TableName,
      Key: { 'refreshToken':id },
    };
    console.log(params)
    try{
      await documentClient.delete(params).promise();
    }
    catch(err){
      console.error('ERROR FOUND')
      console.error(err)
      throw Error(`There was an error deleting refresh token ${id} from ${TableName}. Error: ${JSON.stringify(err.message,null,2)}`)
    }
    return true;
  },
  async getItemsQuery(userName, TableName){
    const params = {
      TableName,
      KeyConditionExpression: 'userName = :ukey',
      ExpressionAttributeValues: {
          ':ukey': userName
      }
    };
    const data = await documentClient.query(params).promise();
    console.log('Items returned: ',data);
    if (data == null || data.Items == null) {
      return null;
    }
    return data.Items;
  },

  async getIfExists(userName, TableName) {
    const params = {
      TableName,
      Key: { userName, },
    };
    const data = await documentClient.get(params).promise();
    if (!data || !data.Item) {
      return null;
    }
    return data.Item;
  },

  async write(data, TableName) {
    /*if (!data.id) {
      throw Error("no ID on data");
    }*/

    const params = {
      TableName,
      Item: data,
    };
    const res = await documentClient.put(params).promise();
    if (!res) {
      throw Error(`There was an error inserting ID of ${data.id} in table ${TableName}`);
    }
    console.log(res);
    return data;
  },

  async update(params) {
    const res = await documentClient.update(params).promise();
    if (!res) {
      throw Error(`There was an error inserting ID of ${data.id} in table ${TableName}`);
    }
    console.log('Result from update:');
    console.log(res);
    return res.Attributes;
  },
  async updateCell(data, tableName) {
    if (!data.id) {
      throw Error("no ID on data");
    }

    let id = data.id;
    let currentTime = new Date();
    const params = {
      TableName: tableName,
      Key: { id, },
      UpdateExpression: "set row1 = :r1, row2 = :r2, row3 = :r3, updateTime= :updateTime",
      ExpressionAttributeValues: {
        ":r1": data.row1,
        ":r2": data.row2,
        ":r3": data.row3,
        ":updateTime": currentTime.toISOString(),
      },
      ReturnValues: "ALL_NEW"
    };
    const res = await documentClient.update(params).promise();
    if (!res) {
      throw Error(`There was an error inserting ID of ${data.id} in table ${TableName}`);
    }
    console.log('Result from player card creation:');
    console.log(res);
    return res.Attributes;
  },

  async batchGet(listIds, tableName) {
    console.log('tableName: ',tableName)
    let keyList = listIds.map(listId => {
      return {
        id: listId.toString(),
      }
    })

    const params = {
      RequestItems: {
        'sl-lists': {
          Keys: keyList,
        }
      }
    };

    const res = await documentClient.batchGet(params).promise();
    console.log(res)
    if (!res) {
      throw Error(`There was an error fetching Tickedt Details`);
    }
    return res;
  },
};

module.exports = Dynamo;
