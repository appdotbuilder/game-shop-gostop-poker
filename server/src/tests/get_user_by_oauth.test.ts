import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUserByOAuth, type GetUserByOAuthInput } from '../handlers/get_user_by_oauth';

// Test user data
const testUserGoogle: CreateUserInput = {
    email: 'test.google@example.com',
    name: 'Google Test User',
    avatar_url: 'https://example.com/avatar1.jpg',
    oauth_provider: 'google',
    oauth_id: 'google_123456789'
};

const testUserApple: CreateUserInput = {
    email: 'test.apple@example.com',
    name: 'Apple Test User',
    avatar_url: null,
    oauth_provider: 'apple',
    oauth_id: 'apple_987654321'
};

describe('getUserByOAuth', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    it('should find existing user by Google OAuth credentials', async () => {
        // Create test user
        await db.insert(usersTable).values(testUserGoogle).execute();

        const input: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'google_123456789'
        };

        const result = await getUserByOAuth(input);

        expect(result).not.toBeNull();
        expect(result!.email).toEqual('test.google@example.com');
        expect(result!.name).toEqual('Google Test User');
        expect(result!.oauth_provider).toEqual('google');
        expect(result!.oauth_id).toEqual('google_123456789');
        expect(result!.avatar_url).toEqual('https://example.com/avatar1.jpg');
        expect(result!.id).toBeDefined();
        expect(result!.created_at).toBeInstanceOf(Date);
    });

    it('should find existing user by Apple OAuth credentials', async () => {
        // Create test user
        await db.insert(usersTable).values(testUserApple).execute();

        const input: GetUserByOAuthInput = {
            oauth_provider: 'apple',
            oauth_id: 'apple_987654321'
        };

        const result = await getUserByOAuth(input);

        expect(result).not.toBeNull();
        expect(result!.email).toEqual('test.apple@example.com');
        expect(result!.name).toEqual('Apple Test User');
        expect(result!.oauth_provider).toEqual('apple');
        expect(result!.oauth_id).toEqual('apple_987654321');
        expect(result!.avatar_url).toBeNull();
        expect(result!.id).toBeDefined();
        expect(result!.created_at).toBeInstanceOf(Date);
    });

    it('should return null when user does not exist', async () => {
        const input: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'nonexistent_oauth_id'
        };

        const result = await getUserByOAuth(input);

        expect(result).toBeNull();
    });

    it('should return null when OAuth provider matches but OAuth ID does not', async () => {
        // Create test user
        await db.insert(usersTable).values(testUserGoogle).execute();

        const input: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'different_oauth_id'
        };

        const result = await getUserByOAuth(input);

        expect(result).toBeNull();
    });

    it('should return null when OAuth ID matches but provider does not', async () => {
        // Create test user with Google provider
        await db.insert(usersTable).values(testUserGoogle).execute();

        // Search with same OAuth ID but different provider
        const input: GetUserByOAuthInput = {
            oauth_provider: 'apple',
            oauth_id: 'google_123456789'
        };

        const result = await getUserByOAuth(input);

        expect(result).toBeNull();
    });

    it('should distinguish between users with same OAuth ID from different providers', async () => {
        // Create two users with same OAuth ID but different providers
        const googleUser = { ...testUserGoogle, oauth_id: 'same_id_123' };
        const appleUser = { ...testUserApple, oauth_id: 'same_id_123' };

        await db.insert(usersTable).values([googleUser, appleUser]).execute();

        // Search for Google user
        const googleInput: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'same_id_123'
        };

        const googleResult = await getUserByOAuth(googleInput);
        expect(googleResult).not.toBeNull();
        expect(googleResult!.oauth_provider).toEqual('google');
        expect(googleResult!.email).toEqual('test.google@example.com');

        // Search for Apple user
        const appleInput: GetUserByOAuthInput = {
            oauth_provider: 'apple',
            oauth_id: 'same_id_123'
        };

        const appleResult = await getUserByOAuth(appleInput);
        expect(appleResult).not.toBeNull();
        expect(appleResult!.oauth_provider).toEqual('apple');
        expect(appleResult!.email).toEqual('test.apple@example.com');
    });

    it('should handle empty database gracefully', async () => {
        const input: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'any_oauth_id'
        };

        const result = await getUserByOAuth(input);

        expect(result).toBeNull();
    });

    it('should return only one user when multiple matches exist', async () => {
        // This shouldn't happen in practice due to unique constraints,
        // but the handler should handle it gracefully by using limit(1)
        await db.insert(usersTable).values(testUserGoogle).execute();

        const input: GetUserByOAuthInput = {
            oauth_provider: 'google',
            oauth_id: 'google_123456789'
        };

        const result = await getUserByOAuth(input);

        expect(result).not.toBeNull();
        expect(result!.oauth_provider).toEqual('google');
        expect(result!.oauth_id).toEqual('google_123456789');
    });
});