import { CommonEntity } from 'src/commons/entities';
import { Column } from 'typeorm';

export class Banner extends CommonEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'varchar' })
  href: string;
}
