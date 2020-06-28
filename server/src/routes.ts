import express from 'express';
import PointController from './controllers/PointController';
import ItemController from './controllers/ItemController';

const routes = express.Router();
const pointController = new PointController();
const itemController = new ItemController();

routes.get('/items', itemController.create);

routes.post('/points', pointController.create);
routes.get('/points', pointController.index);
routes.get('/points/:id', pointController.show);

export default routes;