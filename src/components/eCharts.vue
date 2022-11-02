<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from "vue";
import * as echarts from "echarts";

const chartDom = ref();

let myChart: any;

const props = defineProps({
  option: Object,
});

onMounted(() => {
  // 基于准备好的dom，初始化echarts实例
  myChart = echarts.init(chartDom.value);

  console.log(props.option);
  // 绘制图表
  myChart.setOption(props.option, true);
});

onBeforeUnmount(() => {
  myChart.dispose();
});

//监听图表数据时候变化，重新渲染图表
watch(
  () => props.option,
  () => {
    myChart.setOption(props.option, true);
  },
  { deep: true }
);
</script>

<template>
  <div class="echart" ref="chartDom"></div>
</template>

<style lang="scss" scoped>
.echart {
  width: 100%;
  height: 100%;
}
</style>
