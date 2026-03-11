<script lang="ts">
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<div>
	<h1>My Items</h1>
	<a href={resolve('/(authed)/items/new')}>New Item</a>
	{@render children()}
</div>
