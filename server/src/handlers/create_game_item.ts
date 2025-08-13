import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type CreateGameItemInput, type GameItem } from '../schema';

export const createGameItem = async (input: CreateGameItemInput): Promise<GameItem> => {
  try {
    // Insert game item record
    const result = await db.insert(gameItemsTable)
      .values({
        title: input.title,
        description: input.description,
        detailed_description: input.detailed_description,
        price: input.price.toString(), // Convert number to string for numeric column
        game_type: input.game_type,
        image_url: input.image_url,
        is_available: input.is_available // Boolean column - no conversion needed
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const gameItem = result[0];
    return {
      ...gameItem,
      price: parseFloat(gameItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Game item creation failed:', error);
    throw error;
  }
};