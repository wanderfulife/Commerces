<template>

	<div id="">
		<h1> TEXT</h1>
		<br>
		<label for="1">TEXT</label>
		<input type="checkbox" id="1" value="" v-model="VAR">
		<br>
		<label for="2">TEXT</label>
		<input type="checkbox" id="2" value="" v-model="VAR">
		<br>
		<label for="3">À vélo partagé (VLille, Tier, Lime) // Shared bike</label>
		<input type="checkbox" id="3" value="Vélo partagé" v-model="VAR">
		<br>
		<div v-if="VAR.includes('???')">
			<h1>TEXT</h1>
			<select v-model="VAR2" class="form-control">
				<option v-for="option in VAR3" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<h1>TEXT</h1>
			<select v-model="PassagerQ2" class="form-control">
				<option v-for="option in passagere2" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
		</div>
		<input v-if="ModeDeplacement.includes('Autre')" class="form-control" type="text"
			v-model="ModeDeplacementPrecision" placeholder="Precisez">
		<button v-if="ModeDeplacement" @click="next" class="btn-next">Suivant</button>
		<button @click="back" class="btn-return">retour</button>
	</div>
</template>
<script>
// For multiple reponse
// Extract MotifLD key-value pairs and update headers dynamically
if (docData.VAR) {
	let VARString = "";
	for (const key in docData.VAR) {
		const value = docData.VAR[key];
		// You can customize the separator here (e.g., comma, semicolon)
		VARString += `${key}: ${value}, `;
	}
	// Remove the trailing comma and space from the string
	mappedData.VAR = VARString.slice(0, -2);
}
</script>