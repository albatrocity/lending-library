import { getItem, getItemCommunities } from '$lib/server/services/itemsService';
import {
	getCommunitiesForItemAssignment,
	addItemToCommunity,
	removeItemFromCommunity
} from '$lib/server/services/communitiesService';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();
	const itemId = Number(params.id);
	const item = await getItem(itemId);

	if (!item) {
		return error(404, 'Item not found');
	}

	const isOwner = item.ownerId === user.id;
	const itemCommunities = await getItemCommunities(itemId);

	// Only load available communities if user is the owner
	const availableCommunities = isOwner
		? await getCommunitiesForItemAssignment(user.id, itemId)
		: [];

	return {
		item,
		user,
		isOwner,
		itemCommunities,
		availableCommunities
	};
};

export const actions: Actions = {
	assignToCommunity: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const itemId = Number(event.params.id);
		const item = await getItem(itemId);

		if (!item) {
			return fail(404, { error: 'Item not found' });
		}

		// Only owner can assign
		if (item.ownerId !== event.locals.user.id) {
			return fail(403, { error: 'Only the item owner can assign it to communities' });
		}

		const formData = await event.request.formData();
		const communityId = Number(formData.get('communityId'));

		if (isNaN(communityId)) {
			return fail(400, { error: 'Please select a community' });
		}

		const result = await addItemToCommunity(communityId, itemId);

		if (result.alreadyInCommunity) {
			return fail(400, { error: 'Item is already in this community' });
		}

		return { success: true };
	},

	removeFromCommunity: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const itemId = Number(event.params.id);
		const item = await getItem(itemId);

		if (!item) {
			return fail(404, { error: 'Item not found' });
		}

		// Only owner can remove
		if (item.ownerId !== event.locals.user.id) {
			return fail(403, { error: 'Only the item owner can remove it from communities' });
		}

		const formData = await event.request.formData();
		const communityId = Number(formData.get('communityId'));

		if (isNaN(communityId)) {
			return fail(400, { error: 'Invalid community' });
		}

		await removeItemFromCommunity(communityId, itemId);

		return { removed: true };
	}
};
