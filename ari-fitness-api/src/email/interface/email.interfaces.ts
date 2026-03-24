//email.interface.ts

export interface ResetPasswordEmail {
    name: string
    redirectUrl: string
}

export interface NewUserEmail {
    name: string
    loginLink: string
}

export interface NotificationEmail {
    name: string
    message: string
    actionLink?: string
}