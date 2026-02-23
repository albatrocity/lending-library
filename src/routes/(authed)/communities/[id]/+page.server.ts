import {
	getCommunityById,
	isUserCommunityMember
} from '$lib/server/services/communitiesService';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

	return {
		community,
		isOwner,
		user
	};
};

