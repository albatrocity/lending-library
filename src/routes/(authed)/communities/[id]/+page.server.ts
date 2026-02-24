import {
	getCommunityById,
	isUserCommunityMember,
	getCommunityItems,
	removeItemFromCommunity
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

	// Check if user is a member
	const isMember = await isUserCommunityMember(user.id, communityId);

	if (!isMember) {
		error(403, 'You are not a member of this community');
	}

	const isOwner = community.ownerId === user.id;
	const items = await getCommunityItems(communityId);

	return {
		community,
		isOwner,
		items,
		user
	};
};

export const actions: Actions = {
	removeItem: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const communityId = parseInt(event.params.id);

		if (isNaN(communityId)) {
			return fail(400, { error: 'Invalid community ID' });
		}

		const community = await getCommunityById(communityId);

		if (!community) {
			return fail(404, { error: 'Community not found' });
		}

		// Only owner can remove items
		if (community.ownerId !== event.locals.user.id) {
			return fail(403, { error: 'Only the community owner can remove items' });
		}

		const formData = await event.request.formData();
		const itemId = Number(formData.get('itemId'));

		if (isNaN(itemId)) {
			return fail(400, { error: 'Invalid item' });
		}

		await removeItemFromCommunity(communityId, itemId);

		return { removed: true };
	}
};
