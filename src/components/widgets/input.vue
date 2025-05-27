<template>
	<div id="">
		<h1>TEXT</h1>
		<input class="form-control" type="text" v-model="VAR" placeholder="Precisions">
		<button v-if="VAR" @click="next" class="btn-next">Suivant</button>
		<button @click="back" class="btn-return">retour</button>
	</div>
</template>

<script>
</script>