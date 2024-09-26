import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/common.Middleware.js';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getAuctionById } from './getAuction.js';
import placeBidSchema from "../lib/schemas/placeBidSchema.js";
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

async function placeBid(event, context) {
    const { pathParameters: { id }, body: { amount }, requestContext: { authorizer: { email } } } = event;

    const auction = await getAuctionById(id);

    // Bid identity validation
    if (email === auction.seller) {
        throw new createHttpError.Forbidden("You cannot bid on your own autcions!");
    }

    //  Avoid double bidding
    if (email === auction.highestBid.bidder) {
        throw new createHttpError.Forbidden("You are already the highest bidder!");
    }

    // Auction status validation
    if (auction.status !== "OPEN") {
        throw new createHttpError.BadRequest("You cannot bid on closed auction");
    }

    // Bid amount validation
    if (amount <= auction.highestBid.amount) {
        throw new createHttpError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`);
    }

    const params = {
        TableName: AUCTIONS_TABLE,
        Key: {
            id,
        },
        UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder = :bidder",
        ExpressionAttributeValues: {
            ":amount": amount,
            ":bidder": email,
        },
        ReturnValues: "ALL_NEW",
    };

    try {
        const command = new UpdateCommand(params);
        const { Attributes } = await docClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify(Attributes),
        };
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw new createHttpError.InternalServerError(error);
    }
}

const handler = commonMiddleware(placeBid)
    .use(jsonBodyParser())
    .use(validator({
        eventSchema: transpileSchema(placeBidSchema)
    }));

export { handler };
