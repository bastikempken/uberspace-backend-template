import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createDate?: Date;
}
