<template>

	<div id="" v-if="level === 0">
		<h1> {{TEXT}} </h1>
		<select v-model="VAR" class="form-control">
			<option v-for="option in IMPORT" :key="option.id" :value="option.output">
				{{ option.text }}
			</option>
		</select>
		<button v-if="VAR" @click="next" class="btn-next">Suivant</button>
		<button @click="back" class="btn-return">retour</button>
	</div>
	
</template>

<script>
</script>