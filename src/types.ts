export type TokenUser = {
    id: string,
    nick: string,
    email: string,
    google_id: string
}

export type Token = {
    isScrum: Boolean,
    user: TokenUser
}
  
export type GoogleUser = {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    picture: string
}