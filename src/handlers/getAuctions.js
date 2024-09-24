import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import createHttpError from 'http-errors';
import commonMiddleware from '../lib/common.Middleware.js';

const dynamodb = new DynamoDBClient();
const AUCTIONS_TABLE = "AuctionsTable";
const docClient = DynamoDBDocumentClient.from(dynamodb);

async function getAuctions(event, context) {
    let auctions;

    const params = {
        TableName: AUCTIONS_TABLE,
    };

    try {
        const command = new ScanCommand(params);
        const result = await docClient.send(command);
        auctions = result.Items;

        return {
            statusCode: 200,
            body: JSON.stringify(auctions),
        };
    } catch (error) {
        console.error("Error retrieving auctions:", error);
        throw new createHttpError.InternalServerError(error);
    }
}

const handler = commonMiddleware(getAuctions);

export { handler };
