/*
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { IGeneratedImage } from '@/types';
import { ImageModel } from '@database/models';

export const generateMongoStringId = (): string => {
    return new mongoose.Types.ObjectId().toHexString();
};

export const generateFakeImageData = (image: Partial<IGeneratedImage> = {}): Partial<IGeneratedImage> => {
    const generatedImage: IGeneratedImage = {
        _id: new mongoose.Types.ObjectId(),
        ownerUserId: faker.string.uuid(),
        ownerUserEmail: faker.internet.email(),
        isMinted: faker.datatype.boolean(),
        tokenId: faker.string.uuid(),
        prompt: faker.lorem.sentence(),
        image_url: faker.image.url(),
        createdAt: faker.date.past(),
        generationId: faker.string.uuid(),
        generationTitle: faker.lorem.words(),
        tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
        theme: faker.lorem.word(),
        author: faker.person.firstName(),
        authorEmail: faker.internet.email(),
        nftStorePrice: faker.number.int(),
        nftStoreIds: [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()],
        likes: [faker.string.uuid(), faker.string.uuid(), faker.string.uuid()]
    };

    return { ...generatedImage, ...image };
};

export const newFakeImageData = (image: Partial<IGeneratedImage> = {}) => {
    return new ImageModel(
        generateFakeImageData({
            ...image
        })
    );
};

export const newFakeImageDataInDb = async (image: Partial<IGeneratedImage> = {}) => {
    const doc = newFakeImageData({ ...image });
    return doc.save();
};
*/
