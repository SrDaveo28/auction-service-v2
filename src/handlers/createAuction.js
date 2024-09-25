import { v4 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/common.Middleware.js';
import jsonBodyParser from '@middy/http-json-body-parser';
import createAuctionSchema from "../lib/schemas/createAuctionSchema.js";
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

async function createAuction(event, context) {
    const { title } = event.body;
    const now = new Date();
    const endDate = new Date();
    endDate.setMinutes(now.getMinutes() + 1);
    const auction = {
        id: uuid(),
        title,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        endingAt: endDate.toISOString(),
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
    } catch (error) {
        console.error("Error creating auction:", error);
        throw new createHttpError.InternalServerError(error);
    }

    return {
        statusCode: 201,
        body: JSON.stringify(auction),
    };
}

const handler = commonMiddleware(createAuction)
    .use(jsonBodyParser())
    .use(validator({
        eventSchema: transpileSchema(createAuctionSchema)
    }));

export { handler };
