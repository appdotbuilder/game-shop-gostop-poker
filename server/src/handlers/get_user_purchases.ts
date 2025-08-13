import { db } from '../db';
import { purchasesTable } from '../db/schema';
import { type GetUserPurchasesInput, type Purchase } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getUserPurchases = async (input: GetUserPurchasesInput): Promise<Purchase[]> => {
  try {
    // Query purchases for the specific user, ordered by purchase date (newest first)
    const results = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.user_id, input.user_id))
      .orderBy(desc(purchasesTable.purchase_date))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(purchase => ({
      ...purchase,
      price_paid: parseFloat(purchase.price_paid) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch user purchases:', error);
    throw error;
  }
};