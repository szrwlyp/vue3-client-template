<script setup lang="ts">
import { sessionIdSubject$ } from "@/observable/subjects";
sessionIdSubject$.subscribe({
  next: (res) => {
    console.warn("subject", res);
  },
});
</script>

<template>
  <div>测试</div>
</template>

<style lang="scss" scoped></style>
