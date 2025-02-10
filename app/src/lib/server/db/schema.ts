import { integer, json, pgTable, primaryKey, serial, text, timestamp, varchar, vector } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';



// export const allChats = pgTable('allChats', {
// 	chatId: integer('id').primaryKey(),
// 	createdBy: text('created_by').notNull()
// })


export const documents = pgTable('documents', {
	id: serial('id').primaryKey(),
	pageText: text('page_text').notNull(),
	embedding: vector({ dimensions: 768 }).notNull(),
	metaData: json('meta_data').notNull(),
	chatId: integer('chat_id').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
})
export const chats = pgTable('chats', {
	id: serial('id').primaryKey(),
	chatId: integer('chat_id').notNull(),
	userId: integer('user_id').notNull(),
	prompt: text('prompt').notNull(),
	summary: text('summary'),
	response: text('response').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	sequence: integer('sequence').notNull(),
	ytId:varchar("ytVideoId",{length:11}),
	ytVideoData:text()
})


export const chatsOnDocuments = pgTable("chats_documents", {
	chatId: integer("chat_id").notNull().references(() => chats.id,{onDelete:'cascade'}),
	documentsId: integer("documents_id").notNull().references(() => documents.id,{onDelete:'cascade'})

}, (t) => [
	primaryKey({ columns: [t.chatId, t.documentsId] })
])




export let chatsRelations = relations(chats, ({ many }) => ({
	documents: many(chatsOnDocuments)
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
	chats: many(chatsOnDocuments)
}))

export let chatsOnDocumentsRelation = relations(chatsOnDocuments, ({ one }) => ({

	chat: one(chats, {
		fields: [chatsOnDocuments.chatId],
		references: [chats.id]
	}),

	document: one(documents, {
		fields: [chatsOnDocuments.documentsId],
		references: [documents.id]
	})
}))

