import { Injectable } from '@nestjs/common'
import emailjs from '@emailjs/nodejs'

@Injectable()
export class EmailService {

    async sendEmail(params: {
        title: string,
        to_email: string,
        content: string,
        systemName?: "MvK Gym Manager"
    }) {

        try {

            await emailjs.send(
                process.env.EMAILJS_SERVICE_ID as string,
                process.env.EMAILJS_TEMPLATE_ID as string,
                params,
                {
                    publicKey: process.env.EMAILJS_PUBLIC_KEY as string,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY as string
                }
            )


            console.log("email enviado com sucesso para: ", params.to_email)

        } catch (error) {

            console.error('EmailJS error:', error)

        }

    }

}