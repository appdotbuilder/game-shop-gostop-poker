import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, gameItemsTable, purchasesTable } from '../db/schema';
import { type GetUserPurchasesInput } from '../schema';
import { getUserPurchases } from '../handlers/get_user_purchases';

describe('getUserPurchases', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no purchases', async () => {
    // Create a user with no purchases
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        oauth_provider: 'google',
        oauth_id: 'test-oauth-123'
      })
      .returning()
      .execute();

    const input: GetUserPurchasesInput = {
      user_id: userResult[0].id
    };

    const result = await getUserPurchases(input);

    expect(result).toEqual([]);
  });

  it('should return user purchases ordered by date (newest first)', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        oauth_provider: 'google',
        oauth_id: 'test-oauth-123'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create game items
    const gameItemResults = await db.insert(gameItemsTable)
      .values([
        {
          title: 'Poker Chips',
          description: 'Virtual poker chips',
          detailed_description: 'Premium virtual poker chips for high-stakes games',
          price: '9.99',
          game_type: 'poker',
          image_url: 'https://example.com/chips.jpg',
          is_available: true
        },
        {
          title: 'GoStop Cards',
          description: 'Traditional Korean cards',
          detailed_description: 'Authentic GoStop card deck with beautiful designs',
          price: '14.99',
          game_type: 'gostop',
          image_url: 'https://example.com/cards.jpg',
          is_available: true
        }
      ])
      .returning()
      .execute();

    // Create purchases at different times
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await db.insert(purchasesTable)
      .values([
        {
          user_id: userId,
          item_id: gameItemResults[0].id,
          price_paid: '9.99',
          purchase_date: yesterday,
          status: 'completed'
        },
        {
          user_id: userId,
          item_id: gameItemResults[1].id,
          price_paid: '14.99',
          purchase_date: now,
          status: 'pending'
        }
      ])
      .execute();

    const input: GetUserPurchasesInput = {
      user_id: userId
    };

    const result = await getUserPurchases(input);

    expect(result).toHaveLength(2);

    // Verify ordering (newest first)
    expect(result[0].price_paid).toEqual(14.99);
    expect(result[0].status).toEqual('pending');
    expect(typeof result[0].price_paid).toEqual('number');

    expect(result[1].price_paid).toEqual(9.99);
    expect(result[1].status).toEqual('completed');
    expect(typeof result[1].price_paid).toEqual('number');

    // Verify all required fields are present
    result.forEach(purchase => {
      expect(purchase.id).toBeDefined();
      expect(purchase.user_id).toEqual(userId);
      expect(purchase.item_id).toBeDefined();
      expect(purchase.price_paid).toBeDefined();
      expect(purchase.purchase_date).toBeInstanceOf(Date);
      expect(purchase.status).toMatch(/^(pending|completed|failed|refunded)$/);
    });
  });

  it('should only return purchases for the specified user', async () => {
    // Create two users
    const userResults = await db.insert(usersTable)
      .values([
        {
          email: 'user1@example.com',
          name: 'User 1',
          avatar_url: null,
          oauth_provider: 'google',
          oauth_id: 'user1-oauth'
        },
        {
          email: 'user2@example.com',
          name: 'User 2',
          avatar_url: null,
          oauth_provider: 'apple',
          oauth_id: 'user2-oauth'
        }
      ])
      .returning()
      .execute();

    const user1Id = userResults[0].id;
    const user2Id = userResults[1].id;

    // Create a game item
    const gameItemResult = await db.insert(gameItemsTable)
      .values({
        title: 'Test Item',
        description: 'Test description',
        detailed_description: 'Detailed test description',
        price: '19.99',
        game_type: 'poker',
        image_url: null,
        is_available: true
      })
      .returning()
      .execute();

    const itemId = gameItemResult[0].id;

    // Create purchases for both users
    await db.insert(purchasesTable)
      .values([
        {
          user_id: user1Id,
          item_id: itemId,
          price_paid: '19.99',
          status: 'completed'
        },
        {
          user_id: user2Id,
          item_id: itemId,
          price_paid: '19.99',
          status: 'completed'
        }
      ])
      .execute();

    // Query purchases for user1 only
    const input: GetUserPurchasesInput = {
      user_id: user1Id
    };

    const result = await getUserPurchases(input);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(user1Id);
    expect(result[0].price_paid).toEqual(19.99);
    expect(typeof result[0].price_paid).toEqual('number');
  });

  it('should handle different purchase statuses correctly', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        oauth_provider: 'google',
        oauth_id: 'test-oauth-123'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create a game item
    const gameItemResult = await db.insert(gameItemsTable)
      .values({
        title: 'Test Item',
        description: 'Test description',
        detailed_description: 'Detailed test description',
        price: '25.50',
        game_type: 'gostop',
        image_url: null,
        is_available: true
      })
      .returning()
      .execute();

    const itemId = gameItemResult[0].id;

    // Create purchases with different statuses
    await db.insert(purchasesTable)
      .values([
        {
          user_id: userId,
          item_id: itemId,
          price_paid: '25.50',
          status: 'pending'
        },
        {
          user_id: userId,
          item_id: itemId,
          price_paid: '25.50',
          status: 'completed'
        },
        {
          user_id: userId,
          item_id: itemId,
          price_paid: '25.50',
          status: 'failed'
        },
        {
          user_id: userId,
          item_id: itemId,
          price_paid: '25.50',
          status: 'refunded'
        }
      ])
      .execute();

    const input: GetUserPurchasesInput = {
      user_id: userId
    };

    const result = await getUserPurchases(input);

    expect(result).toHaveLength(4);

    // Verify all statuses are preserved
    const statuses = result.map(p => p.status).sort();
    expect(statuses).toEqual(['completed', 'failed', 'pending', 'refunded']);

    // Verify all have correct numeric price conversion
    result.forEach(purchase => {
      expect(purchase.price_paid).toEqual(25.50);
      expect(typeof purchase.price_paid).toEqual('number');
    });
  });
});