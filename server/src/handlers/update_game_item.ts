import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type UpdateGameItemInput, type GameItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGameItem = async (input: UpdateGameItemInput): Promise<GameItem | null> => {
  try {
    // Extract ID and prepare update data
    const { id, ...updateData } = input;
    
    // Build the update object, converting numeric fields to strings
    const updateValues: any = {};
    
    if (updateData.title !== undefined) {
      updateValues.title = updateData.title;
    }
    if (updateData.description !== undefined) {
      updateValues.description = updateData.description;
    }
    if (updateData.detailed_description !== undefined) {
      updateValues.detailed_description = updateData.detailed_description;
    }
    if (updateData.price !== undefined) {
      updateValues.price = updateData.price.toString(); // Convert number to string for numeric column
    }
    if (updateData.game_type !== undefined) {
      updateValues.game_type = updateData.game_type;
    }
    if (updateData.image_url !== undefined) {
      updateValues.image_url = updateData.image_url;
    }
    if (updateData.is_available !== undefined) {
      updateValues.is_available = updateData.is_available;
    }
    
    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();
    
    // Perform the update operation
    const result = await db.update(gameItemsTable)
      .set(updateValues)
      .where(eq(gameItemsTable.id, id))
      .returning()
      .execute();
    
    // Return null if no rows were updated (item doesn't exist)
    if (result.length === 0) {
      return null;
    }
    
    // Convert numeric fields back to numbers before returning
    const gameItem = result[0];
    return {
      ...gameItem,
      price: parseFloat(gameItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Game item update failed:', error);
    throw error;
  }
};