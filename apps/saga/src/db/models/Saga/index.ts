import { CreationOptional, Model } from 'sequelize';
import { NodeData } from '@/Saga/RefactorSaga2LinkedList';

export class Saga extends Model {
    declare id: CreationOptional<number>;
    declare dataSaga: NodeData[];
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare version: CreationOptional<number>;
}
