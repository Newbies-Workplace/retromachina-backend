import { PassportStrategy } from "@nestjs/passport";
import { config } from "dotenv";
import { Strategy, VerifyCallback } from "passport-google-oauth20";


config()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: 'http://localhost:3000/google/redirect',
            scope: ['email', 'profile'],
        })
    }

    async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback){
        const {name, emails, photos} = profile;
        done(null, {
            email: emails[0].email,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
        });
    }
}