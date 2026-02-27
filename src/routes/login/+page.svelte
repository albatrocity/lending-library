<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let mode: 'signIn' | 'signUp' = $state('signIn');
</script>

<h1>Login</h1>

{#if form?.message}
	<p style="color: red">{form.message}</p>
{/if}

<form method="post" action="?/signInSocial" use:enhance>
	<input type="hidden" name="provider" value="google" />
	<input type="hidden" name="callbackURL" value="/" />
	<button>Sign in with Google</button>
</form>

<hr />

{#if mode === 'signIn'}
	<form method="post" action="?/signInEmail" use:enhance>
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<label>
			Password
			<input type="password" name="password" required />
		</label>
		<button>Sign in with Email</button>
	</form>
	<p>
		Don't have an account?
		<button type="button" onclick={() => (mode = 'signUp')}>Sign up</button>
	</p>
{:else}
	<form method="post" action="?/signUpEmail" use:enhance>
		<label>
			Name
			<input type="text" name="name" required />
		</label>
		<label>
			Email
			<input type="email" name="email" required />
		</label>
		<label>
			Password
			<input type="password" name="password" required minlength="8" />
		</label>
		<button>Sign up</button>
	</form>
	<p>
		Already have an account?
		<button type="button" onclick={() => (mode = 'signIn')}>Sign in</button>
	</p>
{/if}
