// query = query.leftJoinAndMapOne(
//   `${courseEntityName}.purchase`,
//   `${courseEntityName}.${cartEntityName}`,
//   `${cartEntityName} AS ${cartEntityName}a`,
//   `${cartEntityName} AS ${cartEntityName}a.paid = true AND ${cartEntityName} AS ${cartEntityName}a.userId = :userId AND ${cartEntityName} AS ${cartEntityName}a.isActive = true`,
//   { userId },
// );

// query = query.innerJoinAndMapOne(
//   `${courseEntityName}.purchase`,
//   `${courseEntityName}.${cartEntityName}`,
//   `${cartEntityName} AS ${cartEntityName}a`,
//   `${cartEntityName} AS ${cartEntityName}a.paid = true AND ${cartEntityName} AS ${cartEntityName}a.userId = :userId AND ${cartEntityName} AS ${cartEntityName}a.isActive = true`,
//   { userId },
// );
