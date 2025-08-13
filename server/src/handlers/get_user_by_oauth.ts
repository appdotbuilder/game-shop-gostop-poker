import { type User } from '../schema';

export interface GetUserByOAuthInput {
    oauth_provider: 'google' | 'apple';
    oauth_id: string;
}

export const getUserByOAuth = async (input: GetUserByOAuthInput): Promise<User | null> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is finding an existing user by their OAuth provider and ID.
    // Returns null if user doesn't exist, otherwise returns the user record.
    return Promise.resolve(null);
};