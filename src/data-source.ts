import { DataSource } from 'typeorm';
import { Permit } from './entity/PermitEntity'; 
import { User } from './entity/UserEntity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'permit',
    entities: [Permit, User],
    synchronize: true,
    logging: true,
});

export default AppDataSource;
