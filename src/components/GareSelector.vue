<template>
  <div class="form-group">
    <input class="form-control" type="text" v-model="searchTerm" @input="filteredGares" placeholder="Nom Gare"
      @focus="showDropdown = true" />
    <ul v-if="showDropdown && searchTerm && filteredGares.length" class="gare-dropdown">
      <li v-for="item in filteredGares" :key="item['Code UIC']" @click="selectGare(item)">
        {{ item['Nom Gare'] }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import gares from './gare.json';

const showDropdown = ref(false)

const props = defineProps({
  modelValue: String
});
const emit = defineEmits(['update:modelValue']);

const searchTerm = ref(props.modelValue);

watch(searchTerm, (newValue) => {
  emit('update:modelValue', newValue);
});

const filteredGares = computed(() => {
  const searchLower = searchTerm.value.toLowerCase();
  const uniqueGares = new Map();

  for (const item of gares) {
    const nomGare = item['Nom Gare']?.toLowerCase() ?? '';
    if (nomGare.includes(searchLower)) {
      uniqueGares.set(item['Nom Gare'], item);
    }
  }

  return Array.from(uniqueGares.values());
});

const selectGare = (gare) => {
  searchTerm.value = gare['Nom Gare'];
  showDropdown.value = false;
  emit(gare['Code UIC']);
};
</script>

<style>
/* You would add your CSS here for .form-group, .form-control, .gare-dropdown, and li */
.gare-dropdown {
  /* Example styling for the dropdown */
  list-style-type: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
}

.gare-dropdown li {
  padding: 10px;
  cursor: pointer;
  background-color: #1e1e1e;
}

.gare-dropdown li:hover {
  background-color: #1e1e1e;
}
</style>