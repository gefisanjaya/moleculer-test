import { ServiceSchema, Context } from 'moleculer';
import { Permit } from '../entity/PermitEntity';
import AppDataSource from '../data-source';

const permitApproval: ServiceSchema = {
    name: 'permitApproval',

    actions: {
        async submit(ctx: Context<{ userId: string; permitData: any; approvalData: any }>) {
            const { userId, permitData, approvalData } = ctx.params;
            const permit = new Permit();
            permit.status = 'submitted';
            permit.userId = userId;
            permit.permitData = permitData;
            permit.approvalData = approvalData;
            await AppDataSource.getRepository(Permit).save(permit);
            return { status: 'submitted', permitId: permit.permitId };
        },

        async review(ctx: Context<{ permitId: number; approvalData: any }>) {
            const { permitId, approvalData } = ctx.params;
            const permit = await AppDataSource.getRepository(Permit).findOneBy({ permitId });
            if (!permit) {
                throw new Error(`Permit ID ${permitId} not found`);
            }
            permit.status = 'reviewing';
            permit.approvalData = approvalData;
            await AppDataSource.getRepository(Permit).save(permit);
            return { status: 'reviewing', permitId };
        },

        async approve(ctx: Context<{ permitId: number; approverId: string }>) {
            const { permitId, approverId } = ctx.params;
            const permit = await AppDataSource.getRepository(Permit).findOneBy({ permitId });
            if (!permit) {
                throw new Error(`Permit ID ${permitId} not found`);
            }
            permit.status = 'approved';
            permit.approverId = approverId;
            await AppDataSource.getRepository(Permit).save(permit);
            return { status: 'approved', permitId };
        },

        async reject(ctx: Context<{ permitId: number; approverId: string; approvalData: any }>) {
            const { permitId, approverId, approvalData } = ctx.params;
            const permit = await AppDataSource.getRepository(Permit).findOneBy({ permitId });
            if (!permit) {
                throw new Error(`Permit ID ${permitId} not found`);
            }
            permit.status = 'rejected';
            permit.approverId = approverId;
            permit.approvalData = approvalData;
            await AppDataSource.getRepository(Permit).save(permit);
            return { status: 'rejected', permitId };
        },

        async getPermitStatus(ctx: Context<{ permitId: number }>) {
            const { permitId } = ctx.params;
            const permit = await AppDataSource.getRepository(Permit).findOneBy({ permitId });
            if (!permit) {
                throw new Error(`Permit ID ${permitId} not found`);
            }
            return { permitId, status: permit.status };
        },

        async getAllPermits() {
            const permits = await AppDataSource.getRepository(Permit).find();
            return permits;
        }
    },

    async started() {
        try {
            await AppDataSource.initialize();
            this.logger.info("Database connection established.");
        } catch (error) {
            this.logger.error("Unable to connect to the database:", error);
        }
    },

    async stopped() {
        await AppDataSource.destroy();
        this.logger.info("Database connection closed.");
    }
};

export = permitApproval;
