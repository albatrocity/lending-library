import { db } from '$lib/server/db';

export const findUserByEmail = async (email: string) => {
	return await db.query.user.findFirst({
		where: { email }
	});
};
