import { db } from '../db';
import { purchasesTable } from '../db/schema';
import { type Purchase } from '../schema';
import { eq } from 'drizzle-orm';

export interface UpdatePurchaseStatusInput {
    purchase_id: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export const updatePurchaseStatus = async (input: UpdatePurchaseStatusInput): Promise<Purchase | null> => {
    try {
        // Update the purchase status
        const result = await db.update(purchasesTable)
            .set({
                status: input.status
            })
            .where(eq(purchasesTable.id, input.purchase_id))
            .returning()
            .execute();

        // If no rows were updated, the purchase doesn't exist
        if (result.length === 0) {
            return null;
        }

        // Convert numeric fields back to numbers before returning
        const purchase = result[0];
        return {
            ...purchase,
            price_paid: parseFloat(purchase.price_paid) // Convert string back to number
        };
    } catch (error) {
        console.error('Purchase status update failed:', error);
        throw error;
    }
};