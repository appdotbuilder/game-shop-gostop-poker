import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type CreateGameItemInput } from '../schema';
import { getAllGameItems } from '../handlers/get_all_game_items';

// Test game item inputs
const gostopItem: CreateGameItemInput = {
  title: 'GoStop Premium Cards',
  description: 'Premium card set for GoStop',
  detailed_description: 'High quality traditional Korean playing cards perfect for GoStop games',
  price: 29.99,
  game_type: 'gostop',
  image_url: 'https://example.com/gostop-cards.jpg',
  is_available: true
};

const pokerItem: CreateGameItemInput = {
  title: 'Poker Chip Set',
  description: 'Professional poker chips',
  detailed_description: 'Casino-grade poker chips with denominations for serious poker games',
  price: 49.99,
  game_type: 'poker',
  image_url: 'https://example.com/poker-chips.jpg',
  is_available: true
};

const unavailableItem: CreateGameItemInput = {
  title: 'Out of Stock Item',
  description: 'Temporarily unavailable',
  detailed_description: 'This item is currently out of stock',
  price: 19.99,
  game_type: 'gostop',
  image_url: null,
  is_available: false
};

describe('getAllGameItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no game items exist', async () => {
    const result = await getAllGameItems();

    expect(result).toEqual([]);
  });

  it('should return all available game items', async () => {
    // Create test game items
    await db.insert(gameItemsTable)
      .values([
        {
          ...gostopItem,
          price: gostopItem.price.toString()
        },
        {
          ...pokerItem,
          price: pokerItem.price.toString()
        }
      ])
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(2);
    
    // Check that both items are returned
    const titles = result.map(item => item.title);
    expect(titles).toContain('GoStop Premium Cards');
    expect(titles).toContain('Poker Chip Set');
    
    // Verify all fields are present and correctly typed
    result.forEach(item => {
      expect(item.id).toBeDefined();
      expect(typeof item.title).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(typeof item.detailed_description).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(['gostop', 'poker']).toContain(item.game_type);
      expect(typeof item.is_available).toBe('boolean');
      expect(item.is_available).toBe(true);
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should not return unavailable game items', async () => {
    // Create available and unavailable items
    await db.insert(gameItemsTable)
      .values([
        {
          ...gostopItem,
          price: gostopItem.price.toString()
        },
        {
          ...unavailableItem,
          price: unavailableItem.price.toString()
        }
      ])
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('GoStop Premium Cards');
    expect(result[0].is_available).toBe(true);
  });

  it('should return items from both game types', async () => {
    // Create items for both game types
    await db.insert(gameItemsTable)
      .values([
        {
          ...gostopItem,
          price: gostopItem.price.toString()
        },
        {
          ...pokerItem,
          price: pokerItem.price.toString()
        }
      ])
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(2);
    
    const gameTypes = result.map(item => item.game_type);
    expect(gameTypes).toContain('gostop');
    expect(gameTypes).toContain('poker');
  });

  it('should correctly convert numeric price field', async () => {
    await db.insert(gameItemsTable)
      .values({
        ...gostopItem,
        price: gostopItem.price.toString()
      })
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(1);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toBe(29.99);
  });

  it('should handle items with null image_url', async () => {
    const itemWithNullImage = {
      ...gostopItem,
      image_url: null
    };

    await db.insert(gameItemsTable)
      .values({
        ...itemWithNullImage,
        price: itemWithNullImage.price.toString()
      })
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(1);
    expect(result[0].image_url).toBe(null);
    expect(result[0].title).toBe('GoStop Premium Cards');
  });

  it('should handle multiple available items correctly', async () => {
    // Create multiple items of the same type
    const item1 = { ...gostopItem, title: 'GoStop Cards Set 1' };
    const item2 = { ...gostopItem, title: 'GoStop Cards Set 2', price: 39.99 };
    const item3 = { ...pokerItem, title: 'Poker Set Premium' };

    await db.insert(gameItemsTable)
      .values([
        { ...item1, price: item1.price.toString() },
        { ...item2, price: item2.price.toString() },
        { ...item3, price: item3.price.toString() }
      ])
      .execute();

    const result = await getAllGameItems();

    expect(result).toHaveLength(3);
    
    // Verify each item has correct data
    const titles = result.map(item => item.title);
    expect(titles).toContain('GoStop Cards Set 1');
    expect(titles).toContain('GoStop Cards Set 2');
    expect(titles).toContain('Poker Set Premium');
    
    // Check price conversion for different values
    const prices = result.map(item => item.price);
    expect(prices).toContain(29.99);
    expect(prices).toContain(39.99);
    expect(prices).toContain(49.99);
  });
});