import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type GetGameItemByIdInput, type GameItem } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getGameItemById = async (input: GetGameItemByIdInput): Promise<GameItem | null> => {
  try {
    // Query for the specific game item by ID and ensure it's available
    const results = await db.select()
      .from(gameItemsTable)
      .where(and(
        eq(gameItemsTable.id, input.id),
        eq(gameItemsTable.is_available, true)
      ))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const gameItem = results[0];

    // Convert numeric field back to number for the response
    return {
      ...gameItem,
      price: parseFloat(gameItem.price)
    };
  } catch (error) {
    console.error('Get game item by ID failed:', error);
    throw error;
  }
};