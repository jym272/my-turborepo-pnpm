import { CreationOptional, Model } from 'sequelize';

export class Saga extends Model {
    declare id: CreationOptional<number>;
    declare dataSaga: Record<string, string>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare version: CreationOptional<number>;
}
