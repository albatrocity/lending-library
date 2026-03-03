import {
	getBorrowRequestsFromUser,
	getBorrowRequestsForUser
} from '$lib/server/services/borrowRequestsService';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/login');
	}

	const incomingRequests = await getBorrowRequestsForUser(locals.user.id, 'pending');
	const outgoingRequests = await getBorrowRequestsFromUser(locals.user.id, 'pending');

	return { incomingRequests, outgoingRequests };
};
