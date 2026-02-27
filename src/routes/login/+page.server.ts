import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth } from '$lib/server/auth';

export const actions: Actions = {
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'google';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/';

		const result = await auth.api.signInSocial({
			body: {
				provider: provider as 'google',
				callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Social sign-in failed' });
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const name = formData.get('name')?.toString();

		if (!email || !password || !name) {
			return fail(400, { message: 'Email, password, and name are required' });
		}

		const result = await auth.api.signUpEmail({
			body: { email, password, name }
		});

		if (result.user) {
			return redirect(302, '/');
		}
		return fail(400, { message: 'Sign-up failed' });
	},

	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required' });
		}

		const result = await auth.api.signInEmail({
			body: { email, password }
		});

		if (result.user) {
			return redirect(302, '/');
		}
		return fail(400, { message: 'Invalid email or password' });
	}
};
