import { Sequelize } from 'sequelize';
import * as saga from '@db/definitions/Saga';

const appLabels = [saga];

export const initDefinitions = (sequelize: Sequelize) => {
    for (const label of appLabels) {
        label.init(sequelize);
    }
    for (const label of appLabels) {
        label.associate();
    }
};
