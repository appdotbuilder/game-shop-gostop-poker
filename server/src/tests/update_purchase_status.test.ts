import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, gameItemsTable, purchasesTable } from '../db/schema';
import { type UpdatePurchaseStatusInput } from '../handlers/update_purchase_status';
import { updatePurchaseStatus } from '../handlers/update_purchase_status';
import { eq } from 'drizzle-orm';

describe('updatePurchaseStatus', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    let testUserId: string;
    let testItemId: number;
    let testPurchaseId: string;

    beforeEach(async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values({
                email: 'test@example.com',
                name: 'Test User',
                avatar_url: null,
                oauth_provider: 'google',
                oauth_id: 'google123'
            })
            .returning()
            .execute();
        testUserId = userResult[0].id;

        // Create test game item
        const itemResult = await db.insert(gameItemsTable)
            .values({
                title: 'Test Game Item',
                description: 'A test game item',
                detailed_description: 'Detailed description of test game item',
                price: '29.99',
                game_type: 'gostop',
                image_url: null,
                is_available: true
            })
            .returning()
            .execute();
        testItemId = itemResult[0].id;

        // Create test purchase
        const purchaseResult = await db.insert(purchasesTable)
            .values({
                user_id: testUserId,
                item_id: testItemId,
                price_paid: '29.99',
                status: 'pending'
            })
            .returning()
            .execute();
        testPurchaseId = purchaseResult[0].id;
    });

    it('should update purchase status to completed', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: testPurchaseId,
            status: 'completed'
        };

        const result = await updatePurchaseStatus(input);

        // Verify return value
        expect(result).toBeDefined();
        expect(result!.id).toEqual(testPurchaseId);
        expect(result!.status).toEqual('completed');
        expect(result!.user_id).toEqual(testUserId);
        expect(result!.item_id).toEqual(testItemId);
        expect(result!.price_paid).toEqual(29.99);
        expect(typeof result!.price_paid).toBe('number');
        expect(result!.purchase_date).toBeInstanceOf(Date);
    });

    it('should update purchase status to failed', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: testPurchaseId,
            status: 'failed'
        };

        const result = await updatePurchaseStatus(input);

        expect(result).toBeDefined();
        expect(result!.status).toEqual('failed');
        expect(result!.id).toEqual(testPurchaseId);
    });

    it('should update purchase status to refunded', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: testPurchaseId,
            status: 'refunded'
        };

        const result = await updatePurchaseStatus(input);

        expect(result).toBeDefined();
        expect(result!.status).toEqual('refunded');
        expect(result!.id).toEqual(testPurchaseId);
    });

    it('should persist status change in database', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: testPurchaseId,
            status: 'completed'
        };

        await updatePurchaseStatus(input);

        // Query database to verify persistence
        const purchases = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.id, testPurchaseId))
            .execute();

        expect(purchases).toHaveLength(1);
        expect(purchases[0].status).toEqual('completed');
        expect(purchases[0].id).toEqual(testPurchaseId);
        expect(parseFloat(purchases[0].price_paid)).toEqual(29.99);
    });

    it('should return null for non-existent purchase', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: '00000000-0000-0000-0000-000000000000', // Non-existent UUID
            status: 'completed'
        };

        const result = await updatePurchaseStatus(input);

        expect(result).toBeNull();
    });

    it('should handle status change from completed back to pending', async () => {
        // First set to completed
        await updatePurchaseStatus({
            purchase_id: testPurchaseId,
            status: 'completed'
        });

        // Then change back to pending
        const result = await updatePurchaseStatus({
            purchase_id: testPurchaseId,
            status: 'pending'
        });

        expect(result).toBeDefined();
        expect(result!.status).toEqual('pending');

        // Verify in database
        const purchases = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.id, testPurchaseId))
            .execute();

        expect(purchases[0].status).toEqual('pending');
    });

    it('should handle multiple status changes correctly', async () => {
        const statusSequence: ('pending' | 'completed' | 'failed' | 'refunded')[] = [
            'completed',
            'refunded',
            'failed',
            'pending'
        ];

        for (const status of statusSequence) {
            const result = await updatePurchaseStatus({
                purchase_id: testPurchaseId,
                status
            });

            expect(result).toBeDefined();
            expect(result!.status).toEqual(status);
            expect(result!.id).toEqual(testPurchaseId);
        }

        // Verify final state in database
        const purchases = await db.select()
            .from(purchasesTable)
            .where(eq(purchasesTable.id, testPurchaseId))
            .execute();

        expect(purchases[0].status).toEqual('pending');
    });

    it('should preserve all other purchase fields when updating status', async () => {
        const input: UpdatePurchaseStatusInput = {
            purchase_id: testPurchaseId,
            status: 'completed'
        };

        const result = await updatePurchaseStatus(input);

        // Verify all fields are preserved
        expect(result!.user_id).toEqual(testUserId);
        expect(result!.item_id).toEqual(testItemId);
        expect(result!.price_paid).toEqual(29.99);
        expect(result!.purchase_date).toBeInstanceOf(Date);
        expect(result!.status).toEqual('completed');
        expect(result!.id).toEqual(testPurchaseId);
    });
});