import { normalizeMongoIds } from './db';

export function requestFilter(data: Record<string, any>) {
  if (!data) return data;

  delete data.skip;
  delete data.limit;

  const normalized = normalizeMongoIds(data);

  Object.keys(normalized).forEach((key) => {
    const value = normalized[key];

    if (typeof value === 'string') {
      normalized[key] = { $regex: value, $options: 'i' };
    }
  });

  return normalized;
}
