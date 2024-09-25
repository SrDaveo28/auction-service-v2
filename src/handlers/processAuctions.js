import { closeAuction } from "../lib/closeAuction.js";
import { getEndedAuctions } from "../lib/getEndedAuctions.js";
import createHttpError from "http-errors";

async function processAuctions(event, context) {
    try {
        const auctionsToClose = await getEndedAuctions();
        console.log(auctionsToClose);
        
        const closePromises = auctionsToClose.map(auction => closeAuction(auction));

        await Promise.all(closePromises);
        return { closed: closePromises.length };
    } catch (error) {
        console.error("Error processing auctions:", error);
        if (error instanceof Error) {
            throw new createHttpError.InternalServerError(error.message);
        } else {
            throw new createHttpError.InternalServerError("Unknown error occurred");
        }
    }
}


export const handler = processAuctions;