import { relations } from 'drizzle-orm';
import {
	images,
	tags,
	tagsToItems,
	items,
	borrowRequests,
	borrows,
	user,
	communities,
	communityMemberships,
	communityItems,
	activities
} from './schema';

import { session, account } from './auth.schema';

export const communitiesRelations = relations(communities, ({ one, many }) => ({
	owner: one(user, { fields: [communities.ownerId], references: [user.id] }),
	memberships: many(communityMemberships),
	communityItems: many(communityItems)
}));

export const communityMembershipsRelations = relations(communityMemberships, ({ one }) => ({
	community: one(communities, {
		fields: [communityMemberships.communityId],
		references: [communities.id]
	}),
	user: one(user, { fields: [communityMemberships.userId], references: [user.id] })
}));

export const communityItemsRelations = relations(communityItems, ({ one }) => ({
	community: one(communities, {
		fields: [communityItems.communityId],
		references: [communities.id]
	}),
	item: one(items, { fields: [communityItems.itemId], references: [items.id] })
}));

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	borrowRequests: many(borrowRequests),
	borrows: many(borrows, { relationName: 'borrower' }),
	items: many(items)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	tagsToItems: many(tagsToItems)
}));

export const tagsToItemsRelations = relations(tagsToItems, ({ one }) => ({
	tag: one(tags, { fields: [tagsToItems.tagId], references: [tags.id] }),
	item: one(items, { fields: [tagsToItems.itemId], references: [items.id] })
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
	tagsToItems: many(tagsToItems),
	images: many(images),
	lender: one(user, { fields: [items.ownerId], references: [user.id] }),
	borrows: many(borrows),
	borrowRequests: many(borrowRequests),
	activities: many(activities)
}));

export const imagesRelations = relations(images, () => ({}));

export const borrowRequestsRelations = relations(borrowRequests, ({ one }) => ({
	user: one(user, { fields: [borrowRequests.userId], references: [user.id] }),
	item: one(items, { fields: [borrowRequests.itemId], references: [items.id] })
}));

export const borrowsRelations = relations(borrows, ({ one }) => ({
	borrowRequest: one(borrowRequests, {
		fields: [borrows.borrowRequestId],
		references: [borrowRequests.id]
	}),
	item: one(items, { fields: [borrows.itemId], references: [items.id] }),
	borrower: one(user, {
		fields: [borrows.borrowerId],
		references: [user.id],
		relationName: 'borrower'
	}),
	lender: one(user, {
		fields: [borrows.lenderId],
		references: [user.id],
		relationName: 'lender'
	})
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
	actor: one(user, { fields: [activities.actorId], references: [user.id] }),
	community: one(communities, {
		fields: [activities.communityId],
		references: [communities.id]
	}),
	subject: one(items, { fields: [activities.subjectId], references: [items.id] })
}));
