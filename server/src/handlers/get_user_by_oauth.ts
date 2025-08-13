import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';
import { eq, and } from 'drizzle-orm';

export interface GetUserByOAuthInput {
    oauth_provider: 'google' | 'apple';
    oauth_id: string;
}

export const getUserByOAuth = async (input: GetUserByOAuthInput): Promise<User | null> => {
    try {
        const results = await db.select()
            .from(usersTable)
            .where(
                and(
                    eq(usersTable.oauth_provider, input.oauth_provider),
                    eq(usersTable.oauth_id, input.oauth_id)
                )
            )
            .limit(1)
            .execute();

        if (results.length === 0) {
            return null;
        }

        // Return the user (no numeric conversions needed for this table)
        return results[0];
    } catch (error) {
        console.error('Get user by OAuth failed:', error);
        throw error;
    }
};