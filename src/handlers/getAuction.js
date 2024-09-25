import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/common.Middleware.js';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

export async function getAuctionById(id) {
    let auction;
    const params = {
        TableName: AUCTIONS_TABLE,
        Key: {
            id,
        },
    };

    try {
        const command = new GetCommand(params);
        const { Item } = await docClient.send(command);
        if (Item) {
            auction = Item;
        } else {
            throw new createHttpError.NotFound(`Auction not found id: ${id}`);
        }
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw new createHttpError.InternalServerError(error);
    }

    return auction;
}
async function getAuction(event, context) {
    const { id } = event.pathParameters;

    const auction = await getAuctionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };

}

const handler = commonMiddleware(getAuction);

export { handler };
