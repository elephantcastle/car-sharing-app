<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/share-now-logo.png" />
    <select class="location-selector" @change="onCityChange">
      <option v-for="(city, i) in locationsNames" :key="i" :value="city">{{
        city
      }}</option>
    </select>

    <div class="filter-modal" v-if="enableFilterModal">
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

    <SelectedCar :car="selectedCar" />
    <i
      v-if="
        enableFilterModal == false && this.cars.length && !selectedCar.model
      "
      class="filter-button"
      @click="enableFilterModal = !enableFilterModal"
    ></i>
    <div class="map" id="map"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import * as types from "@/common/types";
import SelectedCar from "@/components/SelectedCar.vue";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default Vue.extend({
  name: "Map",
  components: {
    SelectedCar
  },
  data: () => ({
    locations: [] as types.Locations,
    map: {} as L.Map,
    cars: [] as types.Cars,
    enableFilterModal: false,
    fuelAmount: 0,
    layerGroup: {} as L.LayerGroup,
    carOptions: [] as Array<string>,
    carChoice: [] as Array<string>,
    selectedCar: {} as types.Car
  }),
  async mounted() {
    this.map = L.map("map", {
      center: [51.5, 9.97],
      zoom: 5,
      doubleClickZoom: false,
      layers: [
        L.tileLayer(
          "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
          {
            maxZoom: 18
          }
        )
      ]
    }).on("click", () => {
      this.selectedCar = Object.assign({});
      this.enableFilterModal = false;
    });

    await this.fetchLocations();
    for (const location of this.locations) {
      this.locationIcons(location);
    }
  },

  methods: {
    async fetchLocations(): Promise<void> {
      const response: types.Response = await axios.get(
        "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/locations"
      );
      this.locations = response.data.data;
    },

    async locationIcons(location: types.Location): Promise<void> {
      const icon = L.icon({
        iconRetinaUrl: require(`../assets/cities/${location.name}.svg`),
        iconUrl: require(`../assets/cities/${location.name}.svg`),
        shadowSize: [0, 0],
        iconSize: [80, 80]
      });
      const marker = L.marker(
        [
          location.mapSection.center.latitude,
          location.mapSection.center.longitude
        ],
        {
          icon: icon
        }
      ).addTo(this.map);
      marker.on("click", async () => {
        this.map.setView(
          [
            location.mapSection.center.latitude,
            location.mapSection.center.longitude
          ],
          12
        );
        this.map.removeLayer(marker);
        await this.fetchCars(location.name);
        await this.drawCars(undefined);
      });
    },

    async fetchCars(locationName: string): Promise<void> {
      const response: types.ResponseCar = await axios.get(
        `https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/vehicles/${locationName}`
      );
      this.cars = response.data.data;
      this.carOptions = response.data.data
        .map(car => car.model)
        .filter((v, i, a) => a.indexOf(v) === i);
    },

    async drawCars(filterCars: types.Cars | undefined) {
      const cars = filterCars || this.cars;
      const layerGroup = L.layerGroup(
        cars.map(car => {
          const fuelLevel =
            car.fuel * 100 < 30
              ? "red"
              : car.fuel * 100 < 65
              ? "yellow"
              : "green";
          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div class='marker-pin ${fuelLevel}'></div>
          <i class='${car.model}'></i>
          <div class="car-fuel">${car.fuel * 100}</div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
          });
          const marker = L.marker(
            [car.position.latitude, car.position.longitude],
            {
              icon: icon
            }
          );
          return marker.on("click", () => {
            this.selectedCar = car;
            this.enableFilterModal = false;
            this.map.setView(
              [car.position.latitude, car.position.longitude],
              20
            );
          });
        })
      );
      this.layerGroup = layerGroup;
      this.map.addLayer(layerGroup);
    },

    async onCityChange(e: types.E): Promise<void> {
      const targetLocation: types.Location = this.locations.filter(
        location => location.name === e.target.value
      )[0];
      if (targetLocation) {
        const center = targetLocation.mapSection.center;
        this.map.setView(L.latLng(center.latitude, center.longitude), 10);
        await this.fetchCars(targetLocation.name);
      }
    },

    async applyFilter() {
      this.map.removeLayer(this.layerGroup);
      const filterCars = this.cars.filter(
        car =>
          car.fuel * 100 > this.fuelAmount &&
          (!this.carChoice.length || this.carChoice.includes(car.model))
      );
      await this.drawCars(filterCars);
      this.enableFilterModal = false;
    },

    selectCar(carname: string) {
      if (this.carChoice.includes(carname)) {
        this.carChoice.splice(this.carChoice.indexOf(carname), 1);
      } else {
        this.carChoice.push(carname);
      }
    }
  },
  computed: {
    locationsNames() {
      return this.locations.map(location => location.name);
    }
  }
});
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
