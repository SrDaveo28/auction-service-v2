import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/common.Middleware.js';
import jsonBodyParser from '@middy/http-json-body-parser';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

async function createAuction(event, context) {
    const { title } = event.body;

    const auction = {
        id: uuid(),
        title,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        highestBid: {
            amount: 0
        },
    };

    const params = {
        TableName: AUCTIONS_TABLE,
        Item: auction,
    };

    try {
        const command = new PutCommand(params);
        await docClient.send(command);

        return {
            statusCode: 201,
            body: JSON.stringify(auction),
        };
    } catch (error) {
        console.error("Error creating auction:", error);
        throw new createHttpError.InternalServerError(error);
    }
}

const handler = commonMiddleware(createAuction)
    .use(jsonBodyParser());

export { handler };
