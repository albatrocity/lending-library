<script lang="ts">
	let { data } = $props();
</script>

{#if data.user}
	<h1>Welcome back, {data.user.name}!</h1>
	<nav>
		<ul>
			<li><a href="/items">My Items</a></li>
			<li><a href="/logout">Logout</a></li>
		</ul>
	</nav>
{:else}
	<h1>Welcome to Lending Library</h1>
	<nav>
		<ul>
			<li><a href="/login">Login</a></li>
		</ul>
	</nav>
{/if}