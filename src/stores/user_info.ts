import { defineStore } from "pinia";
import { ref } from "vue";
import { Names } from "./store_name";

export const useUserInfoStore = defineStore(Names.USERSTORE, () => {
  // 用户数据
  const set_userDataStore = ref();
  function setUserData(params: any) {
    set_userDataStore.value = params;
  }

  // sessionId
  const set_sessionIdStore = ref();

  return { set_userDataStore, setUserData, set_sessionIdStore };
});
