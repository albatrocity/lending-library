import { createCommunity } from '$lib/server/services/communitiesService';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createCommunitySchema } from '$lib/schemas/communities';

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = Object.fromEntries(await event.request.formData());

		const { data, success, error } = createCommunitySchema.safeParse(formData);

		if (error || !success || !data) {
			return fail(400, { error: error?.message ?? 'Invalid data' });
		}

		const community = await createCommunity({
			...data,
			ownerId: event.locals.user.id
		});

		redirect(302, `/communities/${community.id}`);
	}
};

