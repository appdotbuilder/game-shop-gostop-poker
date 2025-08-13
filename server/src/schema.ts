import { z } from 'zod';

// Game type enum schema
export const gameTypeSchema = z.enum(['gostop', 'poker']);
export type GameType = z.infer<typeof gameTypeSchema>;

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  oauth_provider: z.enum(['google', 'apple']),
  oauth_id: z.string(),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Game item schema
export const gameItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  detailed_description: z.string(),
  price: z.number().positive(),
  game_type: gameTypeSchema,
  image_url: z.string().nullable(),
  is_available: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type GameItem = z.infer<typeof gameItemSchema>;

// Purchase schema
export const purchaseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  item_id: z.number(),
  price_paid: z.number().positive(),
  purchase_date: z.coerce.date(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded'])
});

export type Purchase = z.infer<typeof purchaseSchema>;

// Input schemas for creating/updating data

// Create user input (from OAuth)
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  oauth_provider: z.enum(['google', 'apple']),
  oauth_id: z.string()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

// Create game item input
export const createGameItemInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  detailed_description: z.string().min(1),
  price: z.number().positive(),
  game_type: gameTypeSchema,
  image_url: z.string().nullable(),
  is_available: z.boolean().default(true)
});

export type CreateGameItemInput = z.infer<typeof createGameItemInputSchema>;

// Update game item input
export const updateGameItemInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  detailed_description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  game_type: gameTypeSchema.optional(),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().optional()
});

export type UpdateGameItemInput = z.infer<typeof updateGameItemInputSchema>;

// Create purchase input
export const createPurchaseInputSchema = z.object({
  user_id: z.string(),
  item_id: z.number(),
  price_paid: z.number().positive()
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseInputSchema>;

// Query schemas
export const getGameItemsByTypeSchema = z.object({
  game_type: gameTypeSchema
});

export type GetGameItemsByTypeInput = z.infer<typeof getGameItemsByTypeSchema>;

export const getGameItemByIdSchema = z.object({
  id: z.number()
});

export type GetGameItemByIdInput = z.infer<typeof getGameItemByIdSchema>;

export const getUserPurchasesSchema = z.object({
  user_id: z.string()
});

export type GetUserPurchasesInput = z.infer<typeof getUserPurchasesSchema>;