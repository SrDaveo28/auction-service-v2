import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import validator from '@middy/validator';
import commonMiddleware from '../lib/common.Middleware.js';
import { transpileSchema } from '@middy/validator/transpile';
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema.js"

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

async function getAuctions(event) {
    const { status } = event.queryStringParameters;


    let auctions;

    const params = {
        TableName: AUCTIONS_TABLE,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeValues: {
            ":status": status,
        },
        ExpressionAttributeNames: {
            "#status": "status",
        },
    };

    try {
        const command = new QueryCommand(params);
        const result = await docClient.send(command);
        auctions = result.Items || [];
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw new createHttpError.InternalServerError(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
}


const handler = commonMiddleware(getAuctions)
    .use(validator({
        eventSchema: transpileSchema(getAuctionsSchema),
        strict: false,
        useDefaults: true,
    }));

export { handler };
