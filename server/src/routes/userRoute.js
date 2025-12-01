import { Router } from "express";
import { body } from "express-validator";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import passport from "passport";
const requireJwt = passport.authenticate("jwt", { session: false });
const userRouter = Router();

// Define user-related routes here
userRouter.get("/", (req, res) => {
    res.send("User route is working!");
});


//model User {
//   id        Int      @id @default(autoincrement())
//   email     String   @unique
//   name      String
//   username  String   @unique
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   messages  Message[]
//   chats     Chat[] @relation("UserChats")
//   passwordHash  String
// }

userRouter.post("/register", [body("email").isEmail(),
body("password").isLength({ min: 6 }),
body("username").isLength({ min: 3 }),
body("name").not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash
            }
        });
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1d' });
        res.status(201).json({ message: "User registered successfully", userId: user.id, token });
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.post("/login", [body("identifier").not().isEmpty(),
body("password").not().isEmpty()], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

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
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1d' });
        res.status(200).json({ message: "Login successful", userId: user.id, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get("/profile", requireJwt, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, username: true, name: true, createdAt: true, updatedAt: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.delete("/delete", requireJwt, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.id }
        });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.put("/update", [requireJwt, body("email").optional().isEmail(),
    body("name").optional().not().isEmpty(),
    body("username").optional().isLength({ min: 3 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, username } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                email,
                name,
                username
            }
        });
        res.status(200).json({ message: "User updated successfully", user: { id: updatedUser.id, email: updatedUser.email, username: updatedUser.username, name: updatedUser.name } });
    } catch (err) {
        console.error(err);
        if (err.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.post("/changePassword", [requireJwt, body("oldPassword").not().isEmpty(),
    body("newPassword").isLength({ min: 6 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }

        const newHashedPassword = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newHashedPassword }
        });

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get("/list/:page", requireJwt, async (req, res) => {
    const page = parseInt(req.params.page) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    try {
        const users = await prisma.user.findMany({
            skip,
            take: pageSize,
            select: { id: true, username: true, name: true, createdAt: true },
            where: {
                NOT: { id: req.user.id } // Exclude current user
            }
        });
        const totalUsers = await prisma.user.count({
            where: {
                NOT: { id: req.user.id }
            }
        });
        const pages = Math.ceil(totalUsers / pageSize);
        res.status(200).json({ users, pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

userRouter.get("/search/:query", requireJwt, async (req, res) => {
    const query = req.params.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: req.user.id } },
                    {
                        OR: [
                            { username: { contains: query, mode: 'insensitive' } },
                            { name: { contains: query, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            take: 10,
            select: { id: true, username: true, name: true }
        });
        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default userRouter;