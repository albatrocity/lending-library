import {
	getCommunityById,
	isUserCommunityOwner,
	addMemberToCommunity
} from '$lib/server/services/communitiesService';
import { findUserByEmail } from '$lib/server/services/usersService';
import { inviteMemberSchema } from '$lib/schemas/communities';
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

	// Only owner can invite
	const isOwner = await isUserCommunityOwner(user.id, communityId);

	if (!isOwner) {
		error(403, 'Only the community owner can invite members');
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
			return fail(403, { error: 'Only the community owner can invite members' });
		}

		const formData = Object.fromEntries(await event.request.formData());

		const { data, success, error: parseError } = inviteMemberSchema.safeParse(formData);

		if (parseError || !success || !data) {
			return fail(400, { error: parseError?.message ?? 'Invalid email address' });
		}

		// Find user by email
		const userToInvite = await findUserByEmail(data.email);

		if (!userToInvite) {
			return fail(404, { error: 'No user found with that email address' });
		}

		// Add to community
		const result = await addMemberToCommunity(communityId, userToInvite.id);

		if (result.alreadyMember) {
			return fail(400, { error: 'User is already a member of this community' });
		}

		return { success: true, invitedEmail: data.email };
	}
};

