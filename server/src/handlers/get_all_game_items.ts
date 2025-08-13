import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type GameItem } from '../schema';
import { eq } from 'drizzle-orm';

export const getAllGameItems = async (): Promise<GameItem[]> => {
  try {
    // Query all available game items from the database
    const results = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.is_available, true))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch game items:', error);
    throw error;
  }
};