import { ServiceSchema, Context } from 'moleculer';
import { User } from '../entity/UserEntity'
import AppDataSource from '../data-source';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../jwtUtils';

const userService: ServiceSchema = {
    name: 'userService',

    actions: {
        async register(ctx: Context<{ username: string; password: string; role: string }>) {
            const { username, password, role } = ctx.params;
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User();
            user.username = username;
            user.password = hashedPassword;
            user.role = role;

            await AppDataSource.getRepository(User).save(user);
            return { message: 'User registered successfully' };
        },

        async login(ctx: Context<{ username: string; password: string }>) {
            const { username, password } = ctx.params;
            const user = await AppDataSource.getRepository(User).findOneBy({ username });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error('Invalid credentials');
            }

            const token = generateToken(user.id, user.role);
            return { token };
        },

        async verifyToken(ctx: Context<{ token: string }>) {
            try {
                const decoded = verifyToken(ctx.params.token);
                return { valid: true, decoded };
            } catch (error) {
                return { valid: false, message: 'Invalid token' };
            }
        }
    },

    async started() {
        try {
            await AppDataSource.initialize();
            this.logger.info('Database connection established.');
        } catch (error) {
            this.logger.error('Unable to connect to the database:', error);
        }
    },

    async stopped() {
        await AppDataSource.destroy();
        this.logger.info('Database connection closed.');
    }
};

export = userService;