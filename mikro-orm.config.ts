import { RequestHistory } from './lib/entities/RequestHistory';
import { config as dotenv } from 'dotenv';
import { MikroORMOptions } from '@mikro-orm/postgresql'; 

dotenv();

const config: MikroORMOptions = {
    //@ts-ignore
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  entities: [RequestHistory],
  tsNode: true,
};

export default config;
