import {
	getBorrowRequestsFromUser,
	getBorrowRequestsForUser
} from '$lib/server/services/borrowRequestsService';
import { getActiveBorrowsForBorrower } from '$lib/server/services/borrowsService';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/login');
	}

	const [incomingRequests, pendingOutgoing, acceptedOutgoing, activeBorrows] = await Promise.all([
		getBorrowRequestsForUser(locals.user.id, 'pending'),
		getBorrowRequestsFromUser(locals.user.id, 'pending'),
		getBorrowRequestsFromUser(locals.user.id, 'accepted'),
		getActiveBorrowsForBorrower(locals.user.id)
	]);

	const activeBorrowRequestIds = new Set(
		activeBorrows.map((b) => b.borrowRequestId).filter((id) => id !== null)
	);
	const readyToPickUp = acceptedOutgoing.filter((r) => !activeBorrowRequestIds.has(r.id));

	return { incomingRequests, pendingOutgoing, readyToPickUp, activeBorrows };
};
