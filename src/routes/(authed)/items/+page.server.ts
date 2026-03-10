import { getItemsForUserCommunities } from '$lib/server/services/itemsService';
import {
	getUserCommunities,
	getTopItemOwnersInUserCommunities
} from '$lib/server/services/communitiesService';
import { searchTags } from '$lib/server/services/tagsService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const { user } = await parent();

	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
	const limit = 20;
	const tagId = url.searchParams.get('tag') ? Number(url.searchParams.get('tag')) : undefined;
	const communityId = url.searchParams.get('community')
		? Number(url.searchParams.get('community'))
		: undefined;
	const ownerId = url.searchParams.get('owner') || undefined;
	const search = url.searchParams.get('q') || undefined;
	const availableToday = url.searchParams.get('available') === '1';

	const [result, communities, topOwners, topTags] = await Promise.all([
		getItemsForUserCommunities({
			userId: user.id,
			page,
			limit,
			tagId,
			communityId,
			ownerId,
			search,
			availableToday
		}),
		getUserCommunities(user.id),
		getTopItemOwnersInUserCommunities(user.id),
		searchTags(undefined, 20)
	]);

	return {
		...result,
		communities,
		topOwners,
		topTags,
		user,
		filters: { tagId, communityId, ownerId, search, availableToday }
	};
};
