<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';

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
	<Button type="submit">Sign in with Google</Button>
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
		<Button type="submit">Sign in with Email</Button>
	</form>
	<p>
		Don't have an account?
		<Button type="button" onclick={() => (mode = 'signUp')} variant="outline">Sign up</Button>
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
		<Button type="submit">Sign up</Button>
	</form>
	<p>
		Already have an account?
		<Button type="button" onclick={() => (mode = 'signIn')} variant="outline">Sign in</Button>
	</p>
{/if}
