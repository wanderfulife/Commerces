<template>
	<div id="">
		<h1>TEXT</h1>
		<div>
			<CommuneSelector v-model="VAR" />
		</div>
		<button v-if="VAR" @click="next" class="btn-next">Suivant</button>
		<button @click="back" class="btn-return">retour</button>
	</div>

</template>

<script>
</script>