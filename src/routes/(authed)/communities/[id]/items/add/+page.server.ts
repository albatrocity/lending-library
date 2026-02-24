import {
	isUserCommunityOwner,
	getOwnerItemsNotInCommunity,
	addItemToCommunity,
	getCommunityById
} from '$lib/server/services/communitiesService';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { user } = await parent();
	const communityId = parseInt(params.id);

	if (isNaN(communityId)) {
		error(400, 'Invalid community ID');
	}

	const community = await getCommunityById(communityId);

	if (!community) {
		error(404, 'Community not found');
	}

	// Only owner can add items
	const isOwner = await isUserCommunityOwner(user.id, communityId);

	if (!isOwner) {
		error(403, 'Only the community owner can add items');
	}

	const availableItems = await getOwnerItemsNotInCommunity(user.id, communityId);

	return {
		community,
		availableItems
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const communityId = parseInt(event.params.id);

		if (isNaN(communityId)) {
			return fail(400, { error: 'Invalid community ID' });
		}

		// Check ownership
		const isOwner = await isUserCommunityOwner(event.locals.user.id, communityId);

		if (!isOwner) {
			return fail(403, { error: 'Only the community owner can add items' });
		}

		const formData = await event.request.formData();
		const itemIds = formData.getAll('itemIds').map((id) => parseInt(id.toString()));

		if (itemIds.length === 0) {
			return fail(400, { error: 'Please select at least one item' });
		}

		// Add each item to the community
		for (const itemId of itemIds) {
			if (!isNaN(itemId)) {
				await addItemToCommunity(communityId, itemId);
			}
		}

		return { success: true, addedCount: itemIds.length };
	}
};

