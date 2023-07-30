import { DataTypes, Sequelize } from 'sequelize';
import { Saga } from '@/db';

export const init = (sequelize: Sequelize) => {
    Saga.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            dataSaga: {
                type: DataTypes.JSONB, // TODO: que es mas efectivo para la base de datos al usar JSON
                allowNull: false,
                field: 'dataSaga'
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        },
        {
            sequelize,
            tableName: 'saga',
            version: true
        }
    );
};

export const associate = () => {
    //
};
