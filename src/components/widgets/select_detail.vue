<template>

	<div id="" v-if="level === ">
		<h1> TEXT </h1>
		<select v-model="VAR" class="form-control">
			<option v-for="option in IMPORT" :key="option.id" :value="option.output">
				{{ option.text }}
			</option>
		</select>
		<input v-if="VAR === 'Autre'" class="form-control" type="text" v-model="VAR_DETAIL" placeholder="Precisions">
		<button v-if="VAR" @click="next" class="btn-next">Suivant</button>
		<button @click="back" class="btn-return">retour</button>
	</div>
	
</template>

<script>
</script>
