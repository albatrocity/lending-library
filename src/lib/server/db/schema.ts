import {
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	boolean,
	index,
	uniqueIndex,
	integer
} from 'drizzle-orm/pg-core';

import { user } from './auth.schema';

export const borrowRequestStatus = pgEnum('borrowRequestStatus', [
	'pending',
	'accepted',
	'rejected'
]);

export const borrowStatus = pgEnum('borrowStatus', ['active', 'returned', 'cancelled']);

export const imageableType = pgEnum('imageableType', [
	'items',
	'users',
	'borrowRequests',
	'borrows'
]);

export const communities = pgTable('communities', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id),
	public: boolean('public').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const tags = pgTable(
	'tags',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull().unique(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [uniqueIndex('tags_name_idx').on(t.name)]
);

export const images = pgTable('images', {
	id: serial('id').primaryKey(),
	url: text('url').notNull(),
	imageableType: imageableType().notNull(),
	imageableId: integer('imageable_id').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const items = pgTable(
	'items',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		description: text('description').notNull(),
		tags: text('tags').array(),
		ownerId: text('owner_id')
			.notNull()
			.references(() => user.id),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow()
	},
	(t) => [index('items_name_idx').on(t.name)]
);

export const borrowRequests = pgTable('borrow_requests', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	itemId: integer('item_id')
		.notNull()
		.references(() => items.id),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date'),
	description: text('description'),
	status: borrowRequestStatus().default('pending'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const borrows = pgTable('borrows', {
	id: serial('id').primaryKey(),
	borrowerId: text('borrower_id')
		.notNull()
		.references(() => user.id),
	lenderId: text('lender_id')
		.notNull()
		.references(() => user.id),
	itemId: integer('item_id')
		.notNull()
		.references(() => items.id),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date'),
	returnDate: timestamp('return_date'),
	status: borrowStatus().notNull().default('active'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const tagsToItems = pgTable(
	'tags_to_items',
	{
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id),
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id)
	},
	(t) => [primaryKey({ columns: [t.tagId, t.itemId] })]
);

export * from './auth.schema';
