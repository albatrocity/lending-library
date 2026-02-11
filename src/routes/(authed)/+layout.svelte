<script lang="ts">
	let { children, data } = $props();
</script>

<div>
	<h1>Hi, {data.user.name}!</h1>
	<p>Your user ID is {data.user.id}.</p>

	<form method="post" action="/logout">
		<button>Sign out</button>
	</form>

	{@render children()}
</div>
