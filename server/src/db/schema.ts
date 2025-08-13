import { pgTable, text, uuid, timestamp, serial, numeric, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const gameTypeEnum = pgEnum('game_type', ['gostop', 'poker']);
export const oauthProviderEnum = pgEnum('oauth_provider', ['google', 'apple']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'failed', 'refunded']);

// Users table
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'), // Nullable
  oauth_provider: oauthProviderEnum('oauth_provider').notNull(),
  oauth_id: text('oauth_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Game items table
export const gameItemsTable = pgTable('game_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  detailed_description: text('detailed_description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Use numeric for monetary values
  game_type: gameTypeEnum('game_type').notNull(),
  image_url: text('image_url'), // Nullable
  is_available: boolean('is_available').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Purchases table
export const purchasesTable = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => usersTable.id),
  item_id: serial('item_id').notNull().references(() => gameItemsTable.id),
  price_paid: numeric('price_paid', { precision: 10, scale: 2 }).notNull(),
  purchase_date: timestamp('purchase_date').defaultNow().notNull(),
  status: purchaseStatusEnum('status').notNull().default('pending'),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  purchases: many(purchasesTable),
}));

export const gameItemsRelations = relations(gameItemsTable, ({ many }) => ({
  purchases: many(purchasesTable),
}));

export const purchasesRelations = relations(purchasesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [purchasesTable.user_id],
    references: [usersTable.id],
  }),
  item: one(gameItemsTable, {
    fields: [purchasesTable.item_id],
    references: [gameItemsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type GameItem = typeof gameItemsTable.$inferSelect;
export type NewGameItem = typeof gameItemsTable.$inferInsert;

export type Purchase = typeof purchasesTable.$inferSelect;
export type NewPurchase = typeof purchasesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  users: usersTable,
  gameItems: gameItemsTable,
  purchases: purchasesTable,
};

export const schema = {
  ...tables,
  usersRelations,
  gameItemsRelations,
  purchasesRelations,
};