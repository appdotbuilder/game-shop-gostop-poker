import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type CreateGameItemInput } from '../schema';
import { createGameItem } from '../handlers/create_game_item';
import { eq } from 'drizzle-orm';

// Test inputs for different game types
const gostopItemInput: CreateGameItemInput = {
  title: 'Go-Stop Premium Pack',
  description: 'Premium card pack for Go-Stop game',
  detailed_description: 'This premium pack includes 48 beautiful traditional Korean cards with enhanced artwork and special abilities for advanced Go-Stop gameplay.',
  price: 9.99,
  game_type: 'gostop',
  image_url: 'https://example.com/gostop-pack.jpg',
  is_available: true
};

const pokerItemInput: CreateGameItemInput = {
  title: 'Poker Chip Set',
  description: 'Professional poker chip collection',
  detailed_description: 'A complete set of 500 professional-grade poker chips with various denominations, perfect for high-stakes tournaments.',
  price: 24.99,
  game_type: 'poker',
  image_url: null,
  is_available: true
};

const unavailableItemInput: CreateGameItemInput = {
  title: 'Limited Edition Cards',
  description: 'Rare limited edition card set',
  detailed_description: 'Ultra-rare collector edition cards with gold foiling and unique artwork.',
  price: 99.99,
  game_type: 'gostop',
  image_url: 'https://example.com/limited-cards.jpg',
  is_available: false
};

describe('createGameItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a Go-Stop game item', async () => {
    const result = await createGameItem(gostopItemInput);

    // Basic field validation
    expect(result.title).toEqual('Go-Stop Premium Pack');
    expect(result.description).toEqual(gostopItemInput.description);
    expect(result.detailed_description).toEqual(gostopItemInput.detailed_description);
    expect(result.price).toEqual(9.99);
    expect(typeof result.price).toBe('number'); // Verify numeric conversion
    expect(result.game_type).toEqual('gostop');
    expect(result.image_url).toEqual('https://example.com/gostop-pack.jpg');
    expect(result.is_available).toBe(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a Poker game item', async () => {
    const result = await createGameItem(pokerItemInput);

    // Basic field validation
    expect(result.title).toEqual('Poker Chip Set');
    expect(result.description).toEqual(pokerItemInput.description);
    expect(result.detailed_description).toEqual(pokerItemInput.detailed_description);
    expect(result.price).toEqual(24.99);
    expect(typeof result.price).toBe('number'); // Verify numeric conversion
    expect(result.game_type).toEqual('poker');
    expect(result.image_url).toBeNull();
    expect(result.is_available).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an unavailable item', async () => {
    const result = await createGameItem(unavailableItemInput);

    expect(result.title).toEqual('Limited Edition Cards');
    expect(result.price).toEqual(99.99);
    expect(result.is_available).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save game item to database', async () => {
    const result = await createGameItem(gostopItemInput);

    // Query using proper drizzle syntax
    const gameItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, result.id))
      .execute();

    expect(gameItems).toHaveLength(1);
    const savedItem = gameItems[0];
    expect(savedItem.title).toEqual('Go-Stop Premium Pack');
    expect(savedItem.description).toEqual(gostopItemInput.description);
    expect(savedItem.detailed_description).toEqual(gostopItemInput.detailed_description);
    expect(parseFloat(savedItem.price)).toEqual(9.99); // Database stores as string
    expect(savedItem.game_type).toEqual('gostop');
    expect(savedItem.image_url).toEqual('https://example.com/gostop-pack.jpg');
    expect(savedItem.is_available).toBe(true);
    expect(savedItem.created_at).toBeInstanceOf(Date);
    expect(savedItem.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null image_url correctly', async () => {
    const result = await createGameItem(pokerItemInput);

    // Verify null image_url is handled properly
    expect(result.image_url).toBeNull();

    // Verify in database
    const gameItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, result.id))
      .execute();

    expect(gameItems[0].image_url).toBeNull();
  });

  it('should generate unique IDs for multiple items', async () => {
    const result1 = await createGameItem(gostopItemInput);
    const result2 = await createGameItem(pokerItemInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(typeof result1.id).toBe('number');
    expect(typeof result2.id).toBe('number');
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreate = new Date();
    const result = await createGameItem(gostopItemInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  it('should handle decimal prices correctly', async () => {
    const decimalPriceInput: CreateGameItemInput = {
      title: 'Decimal Price Item',
      description: 'Item with decimal price',
      detailed_description: 'Testing decimal price handling',
      price: 15.67,
      game_type: 'poker',
      image_url: null,
      is_available: true
    };

    const result = await createGameItem(decimalPriceInput);

    expect(result.price).toEqual(15.67);
    expect(typeof result.price).toBe('number');

    // Verify precision is maintained in database
    const gameItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, result.id))
      .execute();

    expect(parseFloat(gameItems[0].price)).toEqual(15.67);
  });
});