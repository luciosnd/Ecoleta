import {Request, Response, request} from 'express';
import knex from '../../database/connection';

class PointController{
  async create(request: Request, response: Response){
    const {
      image,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf, 
      items
    } = request.body;
  
    const trx = await knex.transaction();
  
    const newPoint = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const [point_id] = await trx('point').insert(newPoint);
  
    const pointItemRelations = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          point_id, 
          item_id
        }
      });
  
    await trx('point_item').insert(pointItemRelations);
  
    await trx.commit();
  
    return response.json({
      id: point_id,
      ... newPoint
    });
  }

  async show(request: Request, response: Response){
    const point_id = request.params.id;

    const point = await knex('point').select().where({id: point_id}).first();

    if(!point){
      return response.status(400).json({message: 'Point not found.'});
    }

    const serializaedPoint = {
      ...point,
      image_url: 'http://192.168.2.105:3333/uploads/points_images/'+ point.image      
    }

    const items = await knex('item')
      .join('point_item', 'item.id', '=', 'item_id')
      .select('title')
      .where({point_id: point_id});

    return response.json({serializaedPoint, items});
  }

  async index(request: Request, response: Response){
    const {city, uf, items} = request.query;

    const parsedItems = String(items).split(',').map(item => Number(item.trim()));

    const points = await knex('point')
      .join('point_item', 'point.id', '=', 'point_id')
      .select('point.*')
      .where({city: String(city), uf: String(uf)})
      .whereIn('item_id', parsedItems)
      .distinct();
      
    const serializaedPoints = points.map(point => {
      return {
        ...point,
        image_url: 'http://192.168.2.105:3333/uploads/points_images/'+ point.image
      };
    });

    if(!points){
      return response.status(400).json({message: 'No points were found.'});
    }

    return response.json(serializaedPoints);
  }
}

export default PointController;