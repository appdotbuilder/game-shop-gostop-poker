import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type GetGameItemByIdInput, type CreateGameItemInput } from '../schema';
import { getGameItemById } from '../handlers/get_game_item_by_id';

// Test game item data
const testGameItem: CreateGameItemInput = {
  title: 'Test Go-Stop Card Set',
  description: 'A premium Go-Stop card set',
  detailed_description: 'This is a high-quality Go-Stop card set made from premium materials with traditional Korean designs.',
  price: 29.99,
  game_type: 'gostop',
  image_url: 'https://example.com/gostop-cards.jpg',
  is_available: true
};

const unavailableGameItem: CreateGameItemInput = {
  title: 'Unavailable Poker Set',
  description: 'An unavailable poker set',
  detailed_description: 'This poker set is currently unavailable for purchase.',
  price: 49.99,
  game_type: 'poker',
  image_url: 'https://example.com/poker-set.jpg',
  is_available: false
};

describe('getGameItemById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return game item by ID when available', async () => {
    // Insert test game item
    const insertResult = await db.insert(gameItemsTable)
      .values({
        ...testGameItem,
        price: testGameItem.price.toString()
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];
    const input: GetGameItemByIdInput = { id: insertedItem.id };

    // Get the game item
    const result = await getGameItemById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedItem.id);
    expect(result!.title).toEqual('Test Go-Stop Card Set');
    expect(result!.description).toEqual(testGameItem.description);
    expect(result!.detailed_description).toEqual(testGameItem.detailed_description);
    expect(result!.price).toEqual(29.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.game_type).toEqual('gostop');
    expect(result!.image_url).toEqual('https://example.com/gostop-cards.jpg');
    expect(result!.is_available).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when game item does not exist', async () => {
    const input: GetGameItemByIdInput = { id: 99999 };

    const result = await getGameItemById(input);

    expect(result).toBeNull();
  });

  it('should return null when game item is not available', async () => {
    // Insert unavailable game item
    const insertResult = await db.insert(gameItemsTable)
      .values({
        ...unavailableGameItem,
        price: unavailableGameItem.price.toString()
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];
    const input: GetGameItemByIdInput = { id: insertedItem.id };

    // Try to get the unavailable game item
    const result = await getGameItemById(input);

    expect(result).toBeNull();
  });

  it('should handle numeric price conversion correctly', async () => {
    // Insert game item with specific price
    const gameItemWithPrice: CreateGameItemInput = {
      ...testGameItem,
      price: 123.45
    };

    const insertResult = await db.insert(gameItemsTable)
      .values({
        ...gameItemWithPrice,
        price: gameItemWithPrice.price.toString()
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];
    const input: GetGameItemByIdInput = { id: insertedItem.id };

    const result = await getGameItemById(input);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(123.45);
    expect(typeof result!.price).toEqual('number');
  });

  it('should handle game items with null image_url', async () => {
    // Insert game item without image
    const gameItemWithoutImage: CreateGameItemInput = {
      ...testGameItem,
      image_url: null
    };

    const insertResult = await db.insert(gameItemsTable)
      .values({
        ...gameItemWithoutImage,
        price: gameItemWithoutImage.price.toString()
      })
      .returning()
      .execute();

    const insertedItem = insertResult[0];
    const input: GetGameItemByIdInput = { id: insertedItem.id };

    const result = await getGameItemById(input);

    expect(result).not.toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.title).toEqual(testGameItem.title);
  });

  it('should only return available items when multiple items exist', async () => {
    // Insert both available and unavailable items
    const availableResult = await db.insert(gameItemsTable)
      .values({
        ...testGameItem,
        price: testGameItem.price.toString()
      })
      .returning()
      .execute();

    const unavailableResult = await db.insert(gameItemsTable)
      .values({
        ...unavailableGameItem,
        price: unavailableGameItem.price.toString()
      })
      .returning()
      .execute();

    // Try to get the available item
    const availableInput: GetGameItemByIdInput = { id: availableResult[0].id };
    const availableItem = await getGameItemById(availableInput);
    expect(availableItem).not.toBeNull();
    expect(availableItem!.title).toEqual('Test Go-Stop Card Set');

    // Try to get the unavailable item
    const unavailableInput: GetGameItemByIdInput = { id: unavailableResult[0].id };
    const unavailableItem = await getGameItemById(unavailableInput);
    expect(unavailableItem).toBeNull();
  });
});