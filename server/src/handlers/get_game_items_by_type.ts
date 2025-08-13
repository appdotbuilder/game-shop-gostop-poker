import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { type GetGameItemsByTypeInput, type GameItem } from '../schema';

export const getGameItemsByType = async (input: GetGameItemsByTypeInput): Promise<GameItem[]> => {
  try {
    // Query for available game items of the specified type
    const results = await db.select()
      .from(gameItemsTable)
      .where(
        and(
          eq(gameItemsTable.game_type, input.game_type),
          eq(gameItemsTable.is_available, true)
        )
      )
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch game items by type:', error);
    throw error;
  }
};