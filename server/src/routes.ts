import express from 'express';
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';
import multerConfig from './config/multer';
import PointController from './controllers/PointController';
import ItemController from './controllers/ItemController';

const routes = express.Router();
const upload =  multer(multerConfig);

const pointController = new PointController();
const itemController = new ItemController();

routes.get('/items', itemController.create);

routes.post(
  '/points', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),      
    })
  }, {
    abortEarly: false
  }),
  pointController.create
);


routes.get('/points', pointController.index);
routes.get('/points/:id', pointController.show);

export default routes;