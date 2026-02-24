import {
	isUserCommunityOwner,
	getCommunityById
} from '$lib/server/services/communitiesService';
import { createItemInCommunities } from '$lib/server/services/itemsService';
import { createItemSchema } from '$lib/schemas/items';
import { error, fail, redirect } from '@sveltejs/kit';
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
		error(403, 'Only the community owner can create items');
	}

	return {
		community
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
			return fail(403, { error: 'Only the community owner can create items' });
		}

		const formData = Object.fromEntries(await event.request.formData());

		const { data, success, error: parseError } = createItemSchema.safeParse({
			...formData,
			ownerId: event.locals.user.id
		});

		if (parseError || !success || !data) {
			return fail(400, { error: parseError?.message ?? 'Invalid data' });
		}

		// Create the item and add to community
		await createItemInCommunities({
			...data,
			communityIds: [communityId]
		});

		redirect(302, `/communities/${communityId}`);
	}
};
