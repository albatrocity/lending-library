import { getUserCommunities } from '$lib/server/services/communitiesService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	return {
		communities: await getUserCommunities(user.id),
		user
	};
};

