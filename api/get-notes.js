
//Route /notes
//Method  GET
//Access Public
const AWS =  require("aws-sdk")
AWS.config.update({region:'us-east-1'});
const  util =  require("./util");

const dynamodb =  new AWS.DynamoDB.DocumentClient();
const tableName =  process.env.NOTES_TABLE;

exports.handler =  async (event) =>{
      try { 
          let query =  event.queryStringParameters;
          let limit  =  query && query.limit ? parseInt(query.limit) : 5 ;
          let user_id =  util.getUserId(event.headers)
          
          let params =  {
               tableName: tableName,
               KeyConditionExpression: "user_id = :uid",
               ExpressionAttributeValue: {
                    ':uid': user_id
               },
               Limit:limit,
               ScanIndexForward: false
          }

          let startTimeStamp =  query && query.start ? parseInt(query.start) : 0

          if(startTimeStamp > 0){
               params.ExclusiveStartKey =  {
                     user_id: user_id,
                     timestamp: startTimeStamp
               }
          }

          let data =  await dynamodb.query(params).promise()

        return {
             statusCode: 200,
             headers: util.getResponseHeaders(),
             body: JSON.stringify(data)
        }


      } catch (err) {
            console.log('Error',err)
            return {
                 statusCode:err.statusCode ? err.statusCode :500,
                 headers: util.getResponseHeaders() ,
                 body: JSON.parse({
                      error: err.name ? err.name :'Execption',
                      message: err.message ? err.message : 'Unknown Error'
                 })
            }
      }
}
