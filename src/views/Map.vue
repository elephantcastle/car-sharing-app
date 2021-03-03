<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/share-now-logo.png" />
    <select class="location-selector" @change="onCityChange">
      <option v-for="(city, i) in locationsNames" :key="i" :value="city">{{
        city
      }}</option>
    </select>
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

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default Vue.extend({
  name: "Map",
  components: {},
  data: () => ({
    locations: [] as types.Locations,
    map: {} as L.Map
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
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          }
        )
      ]
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
        iconRetinaUrl: require(`../assets/${location.name}.svg`),
        iconUrl: require(`../assets/${location.name}.svg`),
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
        this.fetchCars(location.name, this.map);
      });
    },

    async fetchCars(locationName: string, map: L.Map): Promise<void> {
      const icons = [
        L.icon({
          iconRetinaUrl: require("../assets/car1.png"),
          iconUrl: require("../assets/car1.png"),
          shadowSize: [0, 0],
          iconSize: [100, 100]
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car2.png"),
          iconUrl: require("../assets/car2.png"),
          shadowSize: [0, 0],
          iconSize: [106, 46]
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car3.png"),
          iconUrl: require("../assets/car3.png"),
          shadowSize: [0, 0],
          iconSize: [90, 90]
        })
      ];

      const response: types.ResponseCar = await axios.get(
        `https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io/api/architecture/web-chapter-coding-challenge-api/vehicles/${locationName}`
      );
      const cars = response.data.data;

      cars.forEach((car: types.Car) => {
        L.marker([car.position.latitude, car.position.longitude], {
          icon: icons[Math.floor(Math.random() * icons.length)]
        }).addTo(map);
      });
    },

    onCityChange(e: types.E): void {
      const targetLocation: types.Location = this.locations.filter(
        location => location.name === e.target.value
      )[0];
      if (targetLocation) {
        const center = targetLocation.mapSection.center;
        this.map.setView(L.latLng(center.latitude, center.longitude), 10);
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
