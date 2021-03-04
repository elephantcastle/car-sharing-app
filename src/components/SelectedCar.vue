<template>
  <div class="selected-car-panel" v-if="car.model">
    <img
      :src="require(`@/assets/models/${car.model}.png`)"
      class="selected-car-image"
    />
    <div class="selected-car-model">
      {{ car.model.split("_").join(" ") }}
    </div>
    <div class="selected-car-stats">
      <div>Fuel: {{ car.fuel * 100 }}</div>
      <div>NumberPlate: {{ car.numberPlate }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as types from "@/common/types";

export default Vue.extend({
  name: "SelectedCar",
  props: {
    car: { type: Object as () => types.Car, default: {} }
  }
});
</script>
