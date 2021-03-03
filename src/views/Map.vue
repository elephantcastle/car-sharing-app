<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/share-now-logo.png" />
    <select class="location-selector" @change="onCityChange">
      <option value="Hamburg">
        Hamburg
        </option>
      <option value="Berlin">
        Berlin
        </option>
    </select>
    <div class="map" id="map"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import L from "leaflet";
import $ from "jquery";
import _ from 'underscore';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default Vue.extend({
  name: "Home",
  components: {},
  data: () => ({
    locations: [],
    map: null as L.Map | null,
  }),
  mounted() {
    this.map = L.map("map", {
      center: [51.5, 9.97],
      zoom: 5,
      doubleClickZoom: false,
      layers: [
        L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
          },
        ),
      ],
    });

    this.fetchLocations(this.map);
  },

  methods: {
    async fetchLocations(map) {
      $.get(
        "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/locations",
        async (response: any) => {
          const locations = response.data;
          this.locations = locations;
          for (const location of locations) {
            await this.fetchCars(location.name, map);
          }
        },
      );
    },

    async fetchCars(location, map) {
      let response = await fetch(
        `https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/vehicles/${location}`,
      );
      response = await response.json();

      const icons = [
        L.icon({
          iconRetinaUrl: require("../assets/car1.png"),
          iconUrl: require("../assets/car1.png"),
          shadowSize: [0, 0],
          iconSize: [100, 100],
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car2.png"),
          iconUrl: require("../assets/car2.png"),
          shadowSize: [0, 0],
          iconSize: [106, 46],
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car3.png"),
          iconUrl: require("../assets/car3.png"),
          shadowSize: [0, 0],
          iconSize: [90, 90],
        }),
      ];

      const cars = response.data;

      cars.forEach((car) => {
        L.marker([car.position.latitude, car.position.longitude], {
          icon: icons[Math.floor(Math.random() * icons.length)],
        }).addTo(map);
      });
    },
    onCityChange(event) {
      const targetLocation = _.find(this.locations, (location) => location.name === event.target.value);
      if (targetLocation) {
        const center = targetLocation.mapSection.center;
        this.map.setView(L.latLng(center.latitude, center.longitude), 10);
      }
    },
  },
});
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
