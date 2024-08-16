import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permits')
export class Permit {
    @PrimaryGeneratedColumn()
    permitId!: number;

    @Column()
    status!: string;

    @Column()
    userId!: string;

    @Column('jsonb')
    permitData!: any;

    @Column('jsonb', { nullable: true })
    approvalData?: any;

    @Column({ nullable: true })
    approverId?: string;
}
