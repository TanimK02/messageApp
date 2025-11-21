import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import prisma from "./prisma.js";
import "dotenv/config";
import passport from "passport";

const localStrategy = new LocalStrategy(
    {
        usernameField: "identifier",
        passwordField: "password",
    }, async (identifier, password, done) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier }
                    ]
                }
            });

            if (!user) {
                return done(null, false, { message: "Incorrect username or email." });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
);

const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || "secretkey",
    }, async (jwtPayload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: jwtPayload.id }
            });

            if (!user) {
                return done(null, false, { message: "User not found." });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
);

passport.use(localStrategy);
passport.use(jwtStrategy);

export default passport;