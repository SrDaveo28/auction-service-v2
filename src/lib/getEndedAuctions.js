import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDBClient();
const now = new Date();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

export async function getEndedAuctions() {
    const params = {
        TableName: AUCTIONS_TABLE,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status AND #endDate <= :now",
        ExpressionAttributeNames: {
            "#status": "status",
            "#endDate": "endingAt"
        },
        ExpressionAttributeValues: {
            ":status": { S: "OPEN" }, 
            ":now": { S: now.toISOString() }
        }
    };

    const command = new QueryCommand(params);
    const result = await docClient.send(command);

    return result.Items;
}
