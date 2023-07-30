/*
import { faker } from '@faker-js/faker';
import { generateMongoStringId } from '@tests/utils/generators/generatedImage';

export interface MyData {
    userId: string;
    cookieAuth: string;
    email: string;
}

export const generateFakeMyData = (data: Partial<MyData> = {}): MyData => {
    const generatedMyData: MyData = {
        userId: generateMongoStringId(),
        cookieAuth: faker.string.uuid(),
        email: faker.internet.email()
    };

    return { ...generatedMyData, ...data };
};
*/
