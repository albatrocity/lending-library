<script lang="ts">
	let { children, data } = $props();
	import { enhance } from '$app/forms';
</script>

<div>
	<h1>Hi, {data.user.name}!</h1>
	<p>Your user ID is {data.user.id}.</p>
	<p>Your email is {data.user.email}.</p>

	<nav>
		<ul>
			<li><a href="/items">Items</a></li>
			<li><a href="/communities">Communities</a></li>
			<li><a href="/requests">Requests</a></li>
		</ul>
	</nav>
	<form method="post" action="/logout" use:enhance>
		<button type="submit">Sign out</button>
	</form>

	{@render children()}
</div>
