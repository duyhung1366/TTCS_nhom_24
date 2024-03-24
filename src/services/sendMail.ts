import Mailjet from "node-mailjet";
import logger from "../utils/logger";
import TTCSconfig from "../submodule/common/config";

export default class SendMailService {
    sendMailWithMailjet = async (args: {
        fromEmail: string,
        toEmail: string,
        subject: string,
        content: string
    }) => {
        const { fromEmail, toEmail, content, subject } = args;
        try {
            const helper = new Mailjet({
                apiSecret: process.env.MJ_APIKEY_PRIVATE || "",
                apiKey: process.env.MJ_APIKEY_PUBLIC || ""
            })
            const request = await helper.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: fromEmail,
                            Name: "Elearning-KMA",
                        },
                        To: [
                            {
                                Email: toEmail,
                            },
                        ],
                        Subject: subject,
                        // TextPart: 'Greetings from Mailjet!',
                        HTMLPart: content,
                    },
                ],
            })
            // @ts-ignore
            logger.info(`[Mail] Sent to ${toEmail}, status: ${request.body.Messages[0]?.Status}, ref: ${request.body.Messages[0]?.To[0]?.MessageHref}`);
            return { 
                status: TTCSconfig.STATUS_SUCCESS
            }
        } catch (error) {
            logger.error(error)
            return { 
                status: TTCSconfig.STATUS_FAIL
            }
        }
    }
}