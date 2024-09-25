import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

export async function closeAuction(auction) {
    console.log("closing auction ", auction.id.S);

    const params = {
        TableName: AUCTIONS_TABLE,
        Key: {
            id: auction.id.S,
        },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeValues: {
            ":status": "CLOSED"
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        },
    }

    const command = new UpdateCommand(params);
    const result = await docClient.send(command);

    return result;
}
