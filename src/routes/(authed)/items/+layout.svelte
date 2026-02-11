<script lang="ts">
	let { children } = $props();
</script>

<div>
	<h1>Items</h1>
	<a href="/items/new">New Item</a>
	{@render children()}
</div>
