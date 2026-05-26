import { defineStore } from "pinia";
import { ref, computed } from "vue";
import idnAreas from "virtual:idn-areas";

export const useRegionsStore = defineStore("regions", () => {
  const { provinces: allProvinces, regencies: allRegencies, districts: allDistricts } = idnAreas;

  const selectedProvinceCode = ref("");
  const selectedRegencyCode = ref("");

  // String values used by v-model and task params
  const selectedProvince = ref("");
  const selectedCity = ref("");
  const selectedDistrict = ref("");

  // loadRegions kept for API compatibility — data already available at import time
  function loadRegions() {}

  const provinces = computed(() => allProvinces.map((p) => p.name));

  const cities = computed(() => {
    if (!selectedProvinceCode.value) return [];
    return allRegencies.filter((r) => r.province_code === selectedProvinceCode.value).map((r) => r.name);
  });

  const districts = computed(() => {
    if (!selectedRegencyCode.value) return [];
    return allDistricts.filter((d) => d.regency_code === selectedRegencyCode.value).map((d) => d.name);
  });

  function selectProvince(name) {
    selectedProvince.value = name;
    selectedCity.value = "";
    selectedDistrict.value = "";
    selectedRegencyCode.value = "";
    const found = allProvinces.find((p) => p.name === name);
    selectedProvinceCode.value = found?.code ?? "";
  }

  function selectCity(name) {
    selectedCity.value = name;
    selectedDistrict.value = "";
    const found = allRegencies.find((r) => r.name === name);
    selectedRegencyCode.value = found?.code ?? "";
  }

  function selectDistrict(name) {
    selectedDistrict.value = name;
  }

  function reset() {
    selectedProvince.value = "";
    selectedCity.value = "";
    selectedDistrict.value = "";
    selectedProvinceCode.value = "";
    selectedRegencyCode.value = "";
  }

  return {
    selectedProvince,
    selectedCity,
    selectedDistrict,
    provinces,
    cities,
    districts,
    loadRegions,
    selectProvince,
    selectCity,
    selectDistrict,
    reset,
  };
});
