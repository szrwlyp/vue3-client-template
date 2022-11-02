import { defineStore } from "pinia";
import { ref } from "vue";
import { Names } from "./store_name";

export const useBloodPressureStore = defineStore(Names.BLLODPRESSURE, () => {
  const set_changeDate = ref(Date.now());

  return { set_changeDate };
});
