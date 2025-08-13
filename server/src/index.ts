import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createUserInputSchema,
  createGameItemInputSchema,
  updateGameItemInputSchema,
  createPurchaseInputSchema,
  getGameItemsByTypeSchema,
  getGameItemByIdSchema,
  getUserPurchasesSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUserByOAuth } from './handlers/get_user_by_oauth';
import { createGameItem } from './handlers/create_game_item';
import { getGameItemsByType } from './handlers/get_game_items_by_type';
import { getGameItemById } from './handlers/get_game_item_by_id';
import { getAllGameItems } from './handlers/get_all_game_items';
import { updateGameItem } from './handlers/update_game_item';
import { createPurchase } from './handlers/create_purchase';
import { getUserPurchases } from './handlers/get_user_purchases';
import { updatePurchaseStatus } from './handlers/update_purchase_status';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUserByOAuth: publicProcedure
    .input(z.object({
      oauth_provider: z.enum(['google', 'apple']),
      oauth_id: z.string()
    }))
    .query(({ input }) => getUserByOAuth(input)),

  // Game item management routes
  createGameItem: publicProcedure
    .input(createGameItemInputSchema)
    .mutation(({ input }) => createGameItem(input)),

  getGameItemsByType: publicProcedure
    .input(getGameItemsByTypeSchema)
    .query(({ input }) => getGameItemsByType(input)),

  getGameItemById: publicProcedure
    .input(getGameItemByIdSchema)
    .query(({ input }) => getGameItemById(input)),

  getAllGameItems: publicProcedure
    .query(() => getAllGameItems()),

  updateGameItem: publicProcedure
    .input(updateGameItemInputSchema)
    .mutation(({ input }) => updateGameItem(input)),

  // Purchase management routes
  createPurchase: publicProcedure
    .input(createPurchaseInputSchema)
    .mutation(({ input }) => createPurchase(input)),

  getUserPurchases: publicProcedure
    .input(getUserPurchasesSchema)
    .query(({ input }) => getUserPurchases(input)),

  updatePurchaseStatus: publicProcedure
    .input(z.object({
      purchase_id: z.string(),
      status: z.enum(['pending', 'completed', 'failed', 'refunded'])
    }))
    .mutation(({ input }) => updatePurchaseStatus(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();