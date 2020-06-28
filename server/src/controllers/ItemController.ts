import {Request, Response} from 'express';
import knex from '../../database/connection';

class ItemController{
  async create(request: Request, response: Response){
    const items = await knex('item').select();
  
    const serializaedItems = items.map(item => {
      item.image_url = 'http://localhost:3333/uploads/'+ item.image;
      return item;
    });
  
    return response.json(items);
  }
}

export default ItemController;