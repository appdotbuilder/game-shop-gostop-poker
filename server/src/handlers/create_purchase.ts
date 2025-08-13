import { db } from '../db';
import { purchasesTable, usersTable, gameItemsTable } from '../db/schema';
import { type CreatePurchaseInput, type Purchase } from '../schema';
import { eq } from 'drizzle-orm';

export const createPurchase = async (input: CreatePurchaseInput): Promise<Purchase> => {
  try {
    // Verify that the user exists
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (user.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Verify that the game item exists and is available
    const gameItem = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, input.item_id))
      .execute();

    if (gameItem.length === 0) {
      throw new Error(`Game item with id ${input.item_id} not found`);
    }

    if (!gameItem[0].is_available) {
      throw new Error(`Game item with id ${input.item_id} is not available for purchase`);
    }

    // Insert purchase record
    const result = await db.insert(purchasesTable)
      .values({
        user_id: input.user_id,
        item_id: input.item_id,
        price_paid: input.price_paid.toString(), // Convert number to string for numeric column
        status: 'pending' // Default status for new purchases
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const purchase = result[0];
    return {
      ...purchase,
      price_paid: parseFloat(purchase.price_paid) // Convert string back to number
    };
  } catch (error) {
    console.error('Purchase creation failed:', error);
    throw error;
  }
};