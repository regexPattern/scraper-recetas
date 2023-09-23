<script lang="ts">
	let nombreReceta = "";
	let urlReceta = "";
	let cargando = false;
	let querySql: string | null;

	const obtenerQuerySql = async () => {
		querySql = null;

		const urlParams = new URLSearchParams({
			"nombre-receta": nombreReceta,
			"url-receta": urlReceta
		});

		cargando = true;
		const respuesta = await fetch("/?" + urlParams.toString());
		querySql = await respuesta.text();
		cargando = false;
	};
</script>

<div>
	<form on:submit|preventDefault={obtenerQuerySql}>
		<label for="nombre-receta">Nombre:</label>
		<input id="input-nombre-receta" bind:value={nombreReceta} type="text" />

		<label for="url-receta">URL:</label>
		<input id="input-url-receta" bind:value={urlReceta} type="text" />

		<button type="submit">Generar SQL</button>
	</form>

	{#if querySql}
		<p>{querySql}</p>
	{/if}
</div>
