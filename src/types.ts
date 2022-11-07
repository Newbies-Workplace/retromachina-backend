import { User } from "@prisma/client"

export type Token = {
    user: User
}
  
export type GoogleUser = {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    picture: string
}