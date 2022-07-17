export class EntityUtils {
  getEntityName(Entity: Record<string, any>): string {
    const EntityName = Entity.name;

    return EntityName[0].toLowerCase() + EntityName.slice(1);
  }

  getPagination({
    currentPage,
    pageSize,
  }: {
    currentPage?: string;
    pageSize?: string;
  }): { take: number; skip: number } {
    const currentPageAsNumber = +(currentPage || 1);

    const pageSizeAsNumber = +(pageSize || 50);

    const take = pageSizeAsNumber > 100 ? 100 : pageSizeAsNumber;

    const skip = take * (currentPageAsNumber - 1);

    return { take, skip };
  }
}

export const entityUtils = new EntityUtils();
