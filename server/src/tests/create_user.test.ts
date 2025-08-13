import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Simple test input with Google OAuth
const testInputGoogle: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  oauth_provider: 'google',
  oauth_id: 'google-12345'
};

// Test input with Apple OAuth
const testInputApple: CreateUserInput = {
  email: 'apple@example.com',
  name: 'Apple User',
  avatar_url: null,
  oauth_provider: 'apple',
  oauth_id: 'apple-67890'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with Google OAuth', async () => {
    const result = await createUser(testInputGoogle);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.oauth_provider).toEqual('google');
    expect(result.oauth_id).toEqual('google-12345');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a user with Apple OAuth', async () => {
    const result = await createUser(testInputApple);

    // Basic field validation
    expect(result.email).toEqual('apple@example.com');
    expect(result.name).toEqual('Apple User');
    expect(result.avatar_url).toBeNull();
    expect(result.oauth_provider).toEqual('apple');
    expect(result.oauth_id).toEqual('apple-67890');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInputGoogle);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(users[0].oauth_provider).toEqual('google');
    expect(users[0].oauth_id).toEqual('google-12345');
    expect(users[0].created_at).toBeInstanceOf(Date);
  });

  it('should create user with null avatar_url', async () => {
    const result = await createUser(testInputApple);

    // Query the database to verify null handling
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].avatar_url).toBeNull();
    expect(result.avatar_url).toBeNull();
  });

  it('should generate unique IDs for different users', async () => {
    const user1 = await createUser(testInputGoogle);
    
    const user2Input: CreateUserInput = {
      ...testInputGoogle,
      email: 'different@example.com',
      oauth_id: 'google-different'
    };
    const user2 = await createUser(user2Input);

    expect(user1.id).not.toEqual(user2.id);
    expect(typeof user1.id).toBe('string');
    expect(typeof user2.id).toBe('string');
  });

  it('should handle unique constraint violation for duplicate emails', async () => {
    // Create first user
    await createUser(testInputGoogle);

    // Try to create another user with same email but different oauth_id
    const duplicateEmailInput: CreateUserInput = {
      ...testInputGoogle,
      oauth_id: 'google-different-id'
    };

    // Should throw error due to unique email constraint
    expect(createUser(duplicateEmailInput)).rejects.toThrow();
  });

  it('should create multiple users with different emails successfully', async () => {
    const user1 = await createUser(testInputGoogle);
    const user2 = await createUser(testInputApple);

    // Both should be successfully created
    expect(user1.id).toBeDefined();
    expect(user2.id).toBeDefined();
    expect(user1.id).not.toEqual(user2.id);

    // Verify both exist in database
    const allUsers = await db.select().from(usersTable).execute();
    expect(allUsers).toHaveLength(2);
  });
});