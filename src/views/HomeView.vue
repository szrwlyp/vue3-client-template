<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
console.log(count);
let obj = {
  value: 1,
  obj1: {
    value: 2,
  },
};
</script>

<template>
  <div class="aaa">Hello World</div>
</template>

<style lang="scss" scoped>
$color: red;
.aaa {
  color: $color;
}
</style>
