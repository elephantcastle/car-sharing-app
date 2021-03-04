<template>
  <div class="filter-modal">
    <div>
      Fuel Level: {{ fuelAmount }}
      <input
        id="customRangeInput"
        type="range"
        min="0"
        max="100"
        step="5"
        v-model="fuelAmount"
      />
    </div>
    <div class="filter-models">
      <div
        v-for="car in carOptions"
        :key="car"
        @click="selectCar(car)"
        :class="{ 'car-is-selected': carChoice.includes(car) }"
        class="container-option-car-image"
      >
        <img
          :src="require(`@/assets/models/${car}.png`)"
          class="option-car-image"
        />{{ car.split("_").join(" ") }}
      </div>
    </div>
    <button class="apply-filter" @click="applyFilter">Apply Filter</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as types from "@/common/types";

export default Vue.extend({
  name: "FilterModels",
  props: {
    carOptions: { type: Array as () => Array<types.Car>, default: {} }
  },
  data: () => ({
    fuelAmount: 0,
    carChoice: [] as Array<string>
  }),
  methods: {
    applyFilter() {
      this.$emit("applyfilter", [this.fuelAmount, this.carChoice]);
    },
    selectCar(carname: string) {
      if (this.carChoice.includes(carname)) {
        this.carChoice.splice(this.carChoice.indexOf(carname), 1);
      } else {
        this.carChoice.push(carname);
      }
    }
  }
});
</script>
