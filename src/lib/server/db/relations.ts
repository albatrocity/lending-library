import { defineRelations } from 'drizzle-orm';
import { images, tags, tagsToItems, items, borrowRequests, borrows, user } from './schema';

import { session, account } from './auth.schema';

export const relations = defineRelations(
	{ tags, items, tagsToItems, borrowRequests, borrows, user, images, session, account },
	(r) => ({
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			borrowRequests: r.many.borrowRequests({
				from: r.user.id.through(r.borrowRequests.userId),
				to: r.borrowRequests.id.through(r.borrowRequests.userId)
			}),
			borrows: r.many.borrows({
				from: r.user.id.through(r.borrows.borrowerId),
				to: r.borrows.id.through(r.borrows.borrowerId)
			}),
			items: r.many.items({
				from: r.user.id.through(r.items.ownerId),
				to: r.items.id.through(r.items.ownerId)
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
				from: r.items.id.through(r.borrows.itemId),
				to: r.borrows.id.through(r.borrows.itemId)
			}),
			borrowRequests: r.many.borrowRequests({
				from: r.items.id.through(r.borrowRequests.itemId),
				to: r.borrowRequests.id.through(r.borrowRequests.itemId)
			})
		}
	})
);
