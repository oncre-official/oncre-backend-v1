import { ObjectId } from 'mongodb';
import { Model, PopulateOptions } from 'mongoose';

import { normalizeMongoIds } from '@on/helpers/db';

export interface AggregateOption {
  limit?: number;
  skip?: number;
}

type GenericRecord = Record<string, any> | any;

interface Options {
  aggregate?: AggregateOption;
  populate?: PopulateOptions[];
  sort?: { [key: string]: number };
  select?: string[];
  projection?: { [key: string]: number };
}

export class BaseRepository<T> {
  constructor(private readonly repository: Model<T>) {}

  async find(query?: GenericRecord, options?: Options): Promise<T[]> {
    return await this.queryBuilder(query, options?.populate, options?.sort).exec();
  }

  async findOne(query: GenericRecord, options?: Options): Promise<T> {
    const parsedQuery = normalizeMongoIds(query);

    let queryBuilder: any = this.repository.findOne(parsedQuery);

    if (options && options.populate) queryBuilder = queryBuilder.populate(options.populate);

    return await queryBuilder.exec();
  }

  async findById(id: string | ObjectId, options?: Options): Promise<T> {
    const objectId = new ObjectId(String(id));
    let queryBuilder: any = this.repository.findById(objectId);

    if (options && options.populate) queryBuilder = queryBuilder.populate(options.populate);

    return await queryBuilder.exec();
  }

  async findAndCount(query: GenericRecord, options?: Options): Promise<{ data: T[]; count: number }> {
    const dataQueryBuilder = this.queryBuilder(query, options.populate, options?.sort);
    const countQueryBuilder = this.repository.find(query);

    const [data, count] = await Promise.all([
      dataQueryBuilder
        .select(options.select || '')
        .skip(options.aggregate?.skip || 0)
        .limit(options.aggregate?.limit || 0)
        .exec(),
      countQueryBuilder.countDocuments().exec(),
    ]);

    return { data, count };
  }

  async aggregate(query: any, options?: Options): Promise<T[]> {
    const aggregationPipeline: any[] = query;
    const option = options?.aggregate;

    if (option && option.limit !== undefined) aggregationPipeline.push({ $limit: Number(option.limit) });

    if (option && option.skip !== undefined) aggregationPipeline.push({ $skip: Number(option.skip) });

    return await this.repository.aggregate(aggregationPipeline).exec();
  }

  async distinct(field: string, query?: GenericRecord): Promise<any[]> {
    return await this.repository.distinct(field, query).exec();
  }

  async aggregateAndCount(query: any[], options?: Options): Promise<{ data: T[]; count: number }> {
    const aggregationPipeline: any[] = query || [];
    const option = options?.aggregate;

    if (option && option.limit !== undefined) aggregationPipeline.push({ $limit: Number(option.limit) });

    if (option && option.skip !== undefined) aggregationPipeline.push({ $skip: Number(option.skip) });

    const countPipeline = [...aggregationPipeline];
    const count = await this.repository.aggregate(countPipeline.concat({ $count: 'count' })).exec();

    const dataPipeline: any[] = [...aggregationPipeline];
    if (count[0]?.count > 0) dataPipeline.push({ $limit: count[0]?.count });

    const data = await this.repository.aggregate(dataPipeline).exec();

    return { data, count: count[0]?.count || 0 };
  }

  async create(payload: GenericRecord): Promise<T> {
    return await this.repository.create(payload);
  }

  async createMany(payload: GenericRecord[]): Promise<T[]> {
    return await this.repository.insertMany(payload);
  }

  async updateOne(query: GenericRecord, update: GenericRecord): Promise<T | null> {
    return await this.repository.findOneAndUpdate(query, update, { new: true }).exec();
  }

  async upsert(query: GenericRecord, update: GenericRecord): Promise<void> {
    await this.repository.updateOne(query, update, { upsert: true }).exec();
  }

  async updateById(id: string | ObjectId, update: GenericRecord, options?: GenericRecord): Promise<T | any> {
    const objectId = new ObjectId(String(id));

    return await this.repository.findByIdAndUpdate(objectId, update, { new: true, ...options }).exec();
  }

  async deleteOne(query: GenericRecord): Promise<void> {
    await this.repository.deleteOne(query).exec();
  }

  async deleteById(id: string | ObjectId): Promise<void> {
    const objectId = new ObjectId(String(id));
    await this.repository.findByIdAndDelete(objectId).exec();
  }

  async deleteMany(query: GenericRecord): Promise<void> {
    await this.repository.deleteMany(query);
  }

  private queryBuilder(
    query: GenericRecord = {},
    populateOptions?: PopulateOptions[],
    sortOptions?: { [key: string]: number },
    projectionOptions?: { [key: string]: number },
  ): any {
    let queryBuilder: any = this.repository.find(query, projectionOptions);

    if (populateOptions) queryBuilder = queryBuilder.populate(populateOptions);

    const defaultSortField = 'createdAt';
    const defaultSortDirection = -1;
    const finalSortOptions = sortOptions || { [defaultSortField]: defaultSortDirection };

    queryBuilder = queryBuilder.sort(finalSortOptions);

    return queryBuilder;
  }
}
