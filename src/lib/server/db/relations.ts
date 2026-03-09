import { defineRelations } from 'drizzle-orm';
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
	communityItems
} from './schema';

import { session, account } from './auth.schema';

export const relations = defineRelations(
	{
		tags,
		items,
		tagsToItems,
		borrowRequests,
		borrows,
		user,
		images,
		session,
		account,
		communities,
		communityMemberships,
		communityItems
	},
	(r) => ({
		communities: {
			members: r.many.user({
				from: r.communities.id.through(r.communityMemberships.communityId),
				to: r.user.id.through(r.communityMemberships.userId)
			}),
			items: r.many.items({
				from: r.communities.id.through(r.communityItems.communityId),
				to: r.items.id.through(r.communityItems.itemId)
			})
		},
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			borrowRequests: r.many.borrowRequests({
				from: r.user.id,
				to: r.borrowRequests.userId
			}),
			borrows: r.many.borrows({
				from: r.user.id,
				to: r.borrows.borrowerId
			}),
			items: r.many.items({
				from: r.user.id,
				to: r.items.ownerId
			})
		},
		session: {
			user: r.one.user({
				from: r.session.userId,
				to: r.user.id
			})
		},
		account: {
			user: r.one.user({
				from: r.account.userId,
				to: r.user.id
			})
		},
		tags: {
			items: r.many.items({
				from: r.tags.id.through(r.tagsToItems.tagId),
				to: r.items.id.through(r.tagsToItems.itemId)
			})
		},
		items: {
			tags: r.many.tags(),
			images: r.many.images({
				from: r.items.id.through(r.images.imageableId),
				to: r.images.imageableId.through(r.images.imageableId),
				where: {
					imageableType: 'items'
				}
			}),
			lender: r.one.user({
				from: r.items.ownerId,
				to: r.user.id
			}),
			borrowers: r.many.user({
				from: r.items.id.through(r.borrows.itemId),
				to: r.user.id.through(r.borrows.borrowerId)
			}),
			borrows: r.many.borrows({
				from: r.items.id,
				to: r.borrows.itemId
			}),
			borrowRequests: r.many.borrowRequests({
				from: r.items.id,
				to: r.borrowRequests.itemId
			})
		},
		borrowRequests: {
			user: r.one.user({
				from: r.borrowRequests.userId,
				to: r.user.id
			}),
			item: r.one.items({
				from: r.borrowRequests.itemId,
				to: r.items.id
			})
		},
		borrows: {
			item: r.one.items({
				from: r.borrows.itemId,
				to: r.items.id
			}),
			borrower: r.one.user({
				from: r.borrows.borrowerId,
				to: r.user.id
			}),
			lender: r.one.user({
				from: r.borrows.lenderId,
				to: r.user.id
			})
		}
	})
);
