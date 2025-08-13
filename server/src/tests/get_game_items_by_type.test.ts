import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type GetGameItemsByTypeInput, type CreateGameItemInput } from '../schema';
import { getGameItemsByType } from '../handlers/get_game_items_by_type';
import { eq } from 'drizzle-orm';

// Test inputs
const gostopInput: GetGameItemsByTypeInput = {
  game_type: 'gostop'
};

const pokerInput: GetGameItemsByTypeInput = {
  game_type: 'poker'
};

const testGostopItem: CreateGameItemInput = {
  title: 'Gostop Card Pack',
  description: 'Traditional Korean Gostop cards',
  detailed_description: 'High-quality traditional Korean Gostop playing cards with beautiful artwork',
  price: 15.99,
  game_type: 'gostop',
  image_url: 'https://example.com/gostop.jpg',
  is_available: true
};

const testPokerItem: CreateGameItemInput = {
  title: 'Poker Chip Set',
  description: 'Professional poker chips',
  detailed_description: 'Professional grade poker chips perfect for home games',
  price: 29.99,
  game_type: 'poker',
  image_url: 'https://example.com/poker.jpg',
  is_available: true
};

const unavailableGostopItem: CreateGameItemInput = {
  title: 'Unavailable Gostop Item',
  description: 'This item is not available',
  detailed_description: 'Detailed description for unavailable item',
  price: 9.99,
  game_type: 'gostop',
  image_url: null,
  is_available: false
};

describe('getGameItemsByType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no items exist', async () => {
    const result = await getGameItemsByType(gostopInput);
    
    expect(result).toEqual([]);
  });

  it('should return only gostop items when requesting gostop type', async () => {
    // Create test items
    await db.insert(gameItemsTable)
      .values([
        {
          ...testGostopItem,
          price: testGostopItem.price.toString()
        },
        {
          ...testPokerItem,
          price: testPokerItem.price.toString()
        }
      ])
      .execute();

    const result = await getGameItemsByType(gostopInput);

    expect(result).toHaveLength(1);
    expect(result[0].game_type).toEqual('gostop');
    expect(result[0].title).toEqual('Gostop Card Pack');
    expect(result[0].price).toEqual(15.99);
    expect(typeof result[0].price).toEqual('number');
  });

  it('should return only poker items when requesting poker type', async () => {
    // Create test items
    await db.insert(gameItemsTable)
      .values([
        {
          ...testGostopItem,
          price: testGostopItem.price.toString()
        },
        {
          ...testPokerItem,
          price: testPokerItem.price.toString()
        }
      ])
      .execute();

    const result = await getGameItemsByType(pokerInput);

    expect(result).toHaveLength(1);
    expect(result[0].game_type).toEqual('poker');
    expect(result[0].title).toEqual('Poker Chip Set');
    expect(result[0].price).toEqual(29.99);
    expect(typeof result[0].price).toEqual('number');
  });

  it('should only return available items (is_available = true)', async () => {
    // Create both available and unavailable items
    await db.insert(gameItemsTable)
      .values([
        {
          ...testGostopItem,
          price: testGostopItem.price.toString()
        },
        {
          ...unavailableGostopItem,
          price: unavailableGostopItem.price.toString()
        }
      ])
      .execute();

    const result = await getGameItemsByType(gostopInput);

    expect(result).toHaveLength(1);
    expect(result[0].is_available).toBe(true);
    expect(result[0].title).toEqual('Gostop Card Pack');
  });

  it('should return multiple items of the same type', async () => {
    const secondGostopItem = {
      title: 'Premium Gostop Set',
      description: 'Premium Korean cards',
      detailed_description: 'Premium quality Korean Gostop cards with gold edges',
      price: 25.99,
      game_type: 'gostop' as const,
      image_url: 'https://example.com/premium-gostop.jpg',
      is_available: true
    };

    // Create multiple gostop items
    await db.insert(gameItemsTable)
      .values([
        {
          ...testGostopItem,
          price: testGostopItem.price.toString()
        },
        {
          ...secondGostopItem,
          price: secondGostopItem.price.toString()
        }
      ])
      .execute();

    const result = await getGameItemsByType(gostopInput);

    expect(result).toHaveLength(2);
    expect(result.every(item => item.game_type === 'gostop')).toBe(true);
    expect(result.every(item => item.is_available === true)).toBe(true);
    
    const titles = result.map(item => item.title);
    expect(titles).toContain('Gostop Card Pack');
    expect(titles).toContain('Premium Gostop Set');
  });

  it('should handle nullable image_url correctly', async () => {
    const itemWithNullImage = {
      ...testGostopItem,
      image_url: null
    };

    await db.insert(gameItemsTable)
      .values({
        ...itemWithNullImage,
        price: itemWithNullImage.price.toString()
      })
      .execute();

    const result = await getGameItemsByType(gostopInput);

    expect(result).toHaveLength(1);
    expect(result[0].image_url).toBeNull();
    expect(result[0].title).toEqual('Gostop Card Pack');
  });

  it('should verify items are saved to database correctly', async () => {
    // Create test item via handler
    await db.insert(gameItemsTable)
      .values({
        ...testGostopItem,
        price: testGostopItem.price.toString()
      })
      .execute();

    // Query database directly to verify
    const dbItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.game_type, 'gostop'))
      .execute();

    expect(dbItems).toHaveLength(1);
    expect(dbItems[0].title).toEqual('Gostop Card Pack');
    expect(parseFloat(dbItems[0].price)).toEqual(15.99);
    expect(dbItems[0].is_available).toBe(true);
    expect(dbItems[0].created_at).toBeInstanceOf(Date);
    expect(dbItems[0].updated_at).toBeInstanceOf(Date);
  });
});