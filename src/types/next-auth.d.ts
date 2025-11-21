/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        id: string
    }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
    interface JWT {
        role: string
    }
}
