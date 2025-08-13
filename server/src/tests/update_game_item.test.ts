import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameItemsTable } from '../db/schema';
import { type UpdateGameItemInput } from '../schema';
import { updateGameItem } from '../handlers/update_game_item';
import { eq } from 'drizzle-orm';

describe('updateGameItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Create a test game item to use in tests
  const createTestGameItem = async () => {
    const result = await db.insert(gameItemsTable)
      .values({
        title: 'Original Game',
        description: 'Original description',
        detailed_description: 'Original detailed description',
        price: '29.99',
        game_type: 'gostop',
        image_url: 'http://example.com/original.jpg',
        is_available: true
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update a game item with all fields', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      title: 'Updated Game',
      description: 'Updated description',
      detailed_description: 'Updated detailed description',
      price: 39.99,
      game_type: 'poker',
      image_url: 'http://example.com/updated.jpg',
      is_available: false
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testItem.id);
    expect(result!.title).toEqual('Updated Game');
    expect(result!.description).toEqual('Updated description');
    expect(result!.detailed_description).toEqual('Updated detailed description');
    expect(result!.price).toEqual(39.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.game_type).toEqual('poker');
    expect(result!.image_url).toEqual('http://example.com/updated.jpg');
    expect(result!.is_available).toEqual(false);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > testItem.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      title: 'Partially Updated',
      price: 49.99
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Partially Updated');
    expect(result!.price).toEqual(49.99);
    // Other fields should remain unchanged
    expect(result!.description).toEqual('Original description');
    expect(result!.detailed_description).toEqual('Original detailed description');
    expect(result!.game_type).toEqual('gostop');
    expect(result!.image_url).toEqual('http://example.com/original.jpg');
    expect(result!.is_available).toEqual(true);
  });

  it('should update nullable fields', async () => {
    const testItem = await createTestGameItem();
    
    // Set image_url to null
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      image_url: null
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.image_url).toBeNull();
    expect(result!.title).toEqual('Original Game'); // Other fields unchanged
  });

  it('should update availability status', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      is_available: false
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.is_available).toEqual(false);
  });

  it('should handle price updates correctly', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      price: 99.95
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.price).toEqual(99.95);
    expect(typeof result!.price).toEqual('number');
  });

  it('should return null for non-existent game item', async () => {
    const updateInput: UpdateGameItemInput = {
      id: 999999, // Non-existent ID
      title: 'Should not work'
    };

    const result = await updateGameItem(updateInput);

    expect(result).toBeNull();
  });

  it('should save updates to database', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      title: 'Database Test',
      price: 15.99,
      is_available: false
    };

    const result = await updateGameItem(updateInput);
    expect(result).not.toBeNull();

    // Query database directly to verify changes
    const dbItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, testItem.id))
      .execute();

    expect(dbItems).toHaveLength(1);
    const dbItem = dbItems[0];
    expect(dbItem.title).toEqual('Database Test');
    expect(parseFloat(dbItem.price)).toEqual(15.99);
    expect(dbItem.is_available).toEqual(false);
    expect(dbItem.updated_at).toBeInstanceOf(Date);
    expect(dbItem.updated_at > testItem.updated_at).toBe(true);
  });

  it('should update game type correctly', async () => {
    const testItem = await createTestGameItem();
    
    const updateInput: UpdateGameItemInput = {
      id: testItem.id,
      game_type: 'poker'
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.game_type).toEqual('poker');
    
    // Verify in database
    const dbItems = await db.select()
      .from(gameItemsTable)
      .where(eq(gameItemsTable.id, testItem.id))
      .execute();
    
    expect(dbItems[0].game_type).toEqual('poker');
  });

  it('should handle updates with empty optional fields', async () => {
    const testItem = await createTestGameItem();
    
    // Update with only ID (no other fields)
    const updateInput: UpdateGameItemInput = {
      id: testItem.id
    };

    const result = await updateGameItem(updateInput);

    expect(result).not.toBeNull();
    // All original fields should remain unchanged except updated_at
    expect(result!.title).toEqual('Original Game');
    expect(result!.description).toEqual('Original description');
    expect(result!.price).toEqual(29.99);
    expect(result!.updated_at > testItem.updated_at).toBe(true);
  });
});