import { Router } from "express";
import { body } from "express-validator";
import prisma from "../config/prisma.js";
import { validationResult } from "express-validator";
import passport from "passport";
const requireJwt = passport.authenticate("jwt", { session: false });
const chatRouter = Router();

// model Chat {
//   id        Int      @id @default(autoincrement())
//   title     String
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   messages  Message[]
//   users     User[] @relation("UserChats")
// }

chatRouter.get("/page/:pageIndex", requireJwt, async (req, res) => {
    const pageIndex = parseInt(req.params.pageIndex) || 0;
    const pageSize = 20; // Number of chats per page
    const userId = req.user.id;
    try {
        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: { id: userId }
                }
            },
            skip: pageIndex * pageSize,
            take: pageSize,
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                users: {
                    select: { id: true, username: true, name: true }
                }
            }
        });
        const totalChats = await prisma.chat.count({
            where: {
                users: {
                    some: { id: userId }
                }
            }
        });
        const pages = Math.ceil(totalChats / pageSize);
        res.json({ chats, pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

chatRouter.post("/create", [requireJwt, body("title").not().isEmpty(),
    body("usernames").isArray({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, usernames } = req.body;
    const currentUsername = req.user.username;
    try {
        const existingUsers = await prisma.user.findMany({
            where: {
                username: { in: usernames }
            }
        });
        if (existingUsers.length !== usernames.length) {
            return res.status(400).json({ error: "One or more usernames are invalid" });
        }
        // Always include the current user
        const allUserIds = [...new Set([req.user.id, ...existingUsers.map(u => u.id)])];
        const chat = await prisma.chat.create({
            data: {
                title,
                users: {
                    connect: allUserIds.map(id => ({ id }))
                }
            },
            include: {
                users: {
                    select: { id: true, username: true, name: true }
                }
            }
        });
        res.status(201).json({ message: "Chat created successfully", chat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

chatRouter.put("/rename", [requireJwt, body("chatId").isInt(),
    body("newTitle").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, newTitle } = req.body;
    const userId = req.user.id;

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: { id: userId },
                }
            }
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found or access denied" });
        }
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: { title: newTitle }
        });
        res.json({ message: "Chat renamed successfully", chat: updatedChat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

chatRouter.put("/addUser", [requireJwt, body("chatId").isInt(),
    body("username").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, username } = req.body;
    const userId = req.user.id;

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: { id: userId },
                }
            }
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found or access denied" });
        }
        const userToAdd = await prisma.user.findUnique({
            where: { username }
        });
        if (!userToAdd) {
            return res.status(404).json({ error: "User not found" });
        }
        await prisma.chat.update({
            where: { id: chatId },
            data: {
                users: {
                    connect: { id: userToAdd.id }
                }
            }
        });
        res.json({ message: "User added to chat successfully", user: { id: userToAdd.id, username: userToAdd.username, name: userToAdd.name } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

chatRouter.put("/removeUser", [requireJwt, body("chatId").isInt(),
    body("username").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, username } = req.body;
    const userId = req.user.id;

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: { id: userId },
                }
            }
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found or access denied" });
        }
        const userToRemove = await prisma.user.findUnique({
            where: { username }
        });
        if (!userToRemove) {
            return res.status(404).json({ error: "User not found" });
        }
        await prisma.chat.update({
            where: { id: chatId },
            data: {
                users: {
                    disconnect: { id: userToRemove.id }
                }
            }
        });
        res.json({ message: "User removed from chat successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

chatRouter.get("/:chatId/users", requireJwt, async (req, res) => {
    const chatId = parseInt(req.params.chatId);
    const userId = req.user.id;

    try {
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                users: {
                    some: { id: userId },
                }
            },
            include: {
                users: {
                    select: { id: true, username: true, name: true }
                }
            }
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat not found or access denied" });
        }
        res.json({ users: chat.users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default chatRouter;