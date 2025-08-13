import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new user from OAuth authentication data,
    // persisting it in the database and returning the created user.
    return Promise.resolve({
        id: 'placeholder-uuid',
        email: input.email,
        name: input.name,
        avatar_url: input.avatar_url,
        oauth_provider: input.oauth_provider,
        oauth_id: input.oauth_id,
        created_at: new Date()
    } as User);
};