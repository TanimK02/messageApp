import { Router } from "express";
import { body } from "express-validator";
import prisma from "../config/prisma.js";
import { validationResult } from "express-validator";
import passport from "passport";
const requireJwt = passport.authenticate("jwt", { session: false });
const messageRouter = Router();

// model Message {
//   id        Int      @id @default(autoincrement())
//   content   String
//   chatId    Int
//   chat      Chat     @relation(fields: [chatId], references: [id])
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   userId    Int
//   user      User     @relation(fields: [userId], references: [id])
// }

messageRouter.get("/chat/:chatId/:page", requireJwt, async (req, res) => {
    const chatId = parseInt(req.params.chatId);
    const page = parseInt(req.params.page) || 0;
    const pageSize = 20;
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
        const messages = await prisma.message.findMany({
            where: { chatId },
            skip: page * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });
        const totalMessages = await prisma.message.count({ where: { chatId } });
        const pages = Math.ceil(totalMessages / pageSize);
        res.json({ chat, messages, pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

messageRouter.post("/create", [requireJwt, body("chatId").isInt(),
    body("content").not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { chatId, content } = req.body;
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
        const message = await prisma.message.create({
            data: {
                content,
                chatId,
                userId
            },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });
        res.status(201).json({ message: "Message created successfully", message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

messageRouter.delete("/:messageId", requireJwt, async (req, res) => {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        await prisma.message.delete({
            where: { id: messageId }
        });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

messageRouter.put("/:messageId", [requireJwt, body("content").not().isEmpty()], async (req, res) => {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { content } = req.body;

    try {
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.userId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content }
        });
        res.status(200).json({ message: "Message updated successfully", updatedMessage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default messageRouter;

