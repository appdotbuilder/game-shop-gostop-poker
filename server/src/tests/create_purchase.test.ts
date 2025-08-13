import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { purchasesTable, usersTable, gameItemsTable } from '../db/schema';
import { type CreatePurchaseInput } from '../schema';
import { createPurchase } from '../handlers/create_purchase';
import { eq } from 'drizzle-orm';

// Test data setup
const testUser = {
  email: 'testuser@example.com',
  name: 'Test User',
  avatar_url: null,
  oauth_provider: 'google' as const,
  oauth_id: 'google123'
};

const testGameItem = {
  title: 'Premium Card Pack',
  description: 'A pack of premium cards',
  detailed_description: 'Contains 10 rare cards for enhanced gameplay',
  price: '29.99', // String for numeric column
  game_type: 'poker' as const,
  image_url: 'https://example.com/card-pack.jpg',
  is_available: true
};

const unavailableGameItem = {
  title: 'Unavailable Item',
  description: 'This item is not available',
  detailed_description: 'An item that cannot be purchased',
  price: '19.99', // String for numeric column
  game_type: 'gostop' as const,
  image_url: null,
  is_available: false
};

describe('createPurchase', () => {
  let userId: string;
  let gameItemId: number;
  let unavailableItemId: number;

  beforeEach(async () => {
    await createDB();

    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    userId = userResult[0].id;

    // Create test game item
    const itemResult = await db.insert(gameItemsTable)
      .values(testGameItem)
      .returning()
      .execute();
    gameItemId = itemResult[0].id;

    // Create unavailable game item
    const unavailableResult = await db.insert(gameItemsTable)
      .values(unavailableGameItem)
      .returning()
      .execute();
    unavailableItemId = unavailableResult[0].id;
  });

  afterEach(resetDB);

  it('should create a purchase successfully', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: userId,
      item_id: gameItemId,
      price_paid: 29.99
    };

    const result = await createPurchase(testInput);

    // Verify returned purchase data
    expect(result.user_id).toEqual(userId);
    expect(result.item_id).toEqual(gameItemId);
    expect(result.price_paid).toEqual(29.99);
    expect(typeof result.price_paid).toBe('number');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.purchase_date).toBeInstanceOf(Date);
  });

  it('should save purchase to database', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: userId,
      item_id: gameItemId,
      price_paid: 29.99
    };

    const result = await createPurchase(testInput);

    // Query database to verify purchase was saved
    const purchases = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, result.id))
      .execute();

    expect(purchases).toHaveLength(1);
    expect(purchases[0].user_id).toEqual(userId);
    expect(purchases[0].item_id).toEqual(gameItemId);
    expect(parseFloat(purchases[0].price_paid)).toEqual(29.99);
    expect(purchases[0].status).toEqual('pending');
    expect(purchases[0].purchase_date).toBeInstanceOf(Date);
  });

  it('should handle different price values correctly', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: userId,
      item_id: gameItemId,
      price_paid: 15.50
    };

    const result = await createPurchase(testInput);

    expect(result.price_paid).toEqual(15.50);
    expect(typeof result.price_paid).toBe('number');

    // Verify in database
    const purchases = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.id, result.id))
      .execute();

    expect(parseFloat(purchases[0].price_paid)).toEqual(15.50);
  });

  it('should throw error when user does not exist', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format but non-existent
      item_id: gameItemId,
      price_paid: 29.99
    };

    await expect(createPurchase(testInput)).rejects.toThrow(/user.*not found/i);
  });

  it('should throw error when game item does not exist', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: userId,
      item_id: 99999, // Non-existent item ID
      price_paid: 29.99
    };

    await expect(createPurchase(testInput)).rejects.toThrow(/game item.*not found/i);
  });

  it('should throw error when game item is not available', async () => {
    const testInput: CreatePurchaseInput = {
      user_id: userId,
      item_id: unavailableItemId,
      price_paid: 19.99
    };

    await expect(createPurchase(testInput)).rejects.toThrow(/not available for purchase/i);
  });

  it('should create multiple purchases for same user', async () => {
    const testInput1: CreatePurchaseInput = {
      user_id: userId,
      item_id: gameItemId,
      price_paid: 29.99
    };

    const testInput2: CreatePurchaseInput = {
      user_id: userId,
      item_id: gameItemId,
      price_paid: 29.99
    };

    const result1 = await createPurchase(testInput1);
    const result2 = await createPurchase(testInput2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.user_id).toEqual(result2.user_id);
    expect(result1.item_id).toEqual(result2.item_id);

    // Verify both purchases exist in database
    const purchases = await db.select()
      .from(purchasesTable)
      .where(eq(purchasesTable.user_id, userId))
      .execute();

    expect(purchases).toHaveLength(2);
  });
});