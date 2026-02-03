import { Types } from 'mongoose';

export const normalizeMongoIds = (query: Record<string, any>) => {
  const parsedQuery: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      parsedQuery[key] = new Types.ObjectId(value);
      continue;
    }

    if (Array.isArray(value)) {
      parsedQuery[key] = value.map((v) =>
        typeof v === 'string' && Types.ObjectId.isValid(v) ? new Types.ObjectId(v) : v,
      );
      continue;
    }

    parsedQuery[key] = value;
  }

  return parsedQuery;
};
