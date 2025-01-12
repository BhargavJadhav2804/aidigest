import { integer, json, pgTable, serial, text, timestamp, vector } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';


export const chats = pgTable('chats', {
	id: serial('id').primaryKey(),
	chatId: integer('chat_id').notNull().unique(),
	userId: integer('user_id').notNull(),
	prompt: text('prompt').notNull(),
	response: text('response').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	sequence: integer('sequence').notNull(),
})

export const allChats = pgTable('allChats', {
	chatId: integer('id').primaryKey(),
	createdBy: text('created_by').notNull()
})

export const documents = pgTable('documents', {
	id: serial('id').primaryKey(),
	pageText: text('page_text').notNull(),
	embedding: vector({ dimensions: 768 }).notNull(),
	metaData: json('meta_data').notNull(),
	chatId: integer('chat_id').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export let chatsRelations = relations(chats, ({ many }) => ({
	documents: many(documents)
}))

export const documentsRelations = relations(documents, ({ one }) => ({
	chatId: one(chats, {
		fields: [documents.chatId],
		references: [chats.id]
	})
}))

