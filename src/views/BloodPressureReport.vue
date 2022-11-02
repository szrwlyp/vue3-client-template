<script setup lang="ts">
import { ref, onMounted, WatchEffect, computed, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fromEvent, throttleTime, switchMap, throwError, iif, of } from "rxjs";
import chart from "../components/eCharts.vue";
import { formatDate, oneDayTimeStamp } from "../utils/date_fun";
import { storeToRefs } from "pinia";
import { handleURLParams } from "../utils/u_index";
import { wxAuthorizeLogin } from "../utils/u_wx_fun";
import {
  sessionIdSubject$,
  testSubject$,
  testFun1,
} from "@/observable/subjects";
import {
  getBloodPressureData,
  getBriefLogsData,
  highDefaultArr,
  lowDefaultArr,
} from "../modules/bloodPressure";
import { chartbloodPressure } from "../chart_data/chart_blood_pressure.js";
import VConsole from "vconsole";

import { useUserInfoStore } from "@/stores/user_info";
import { useBloodPressureStore } from "@/stores/blood_pressure";

const userInfo = useUserInfoStore();
const { set_userDataStore, set_sessionIdStore } = storeToRefs(userInfo);
const { set_changeDate } = storeToRefs(useBloodPressureStore());
console.log(set_changeDate);

const route = useRoute();
// 用户信息
let vpas_id = ref("VPAS-RT-000805");

//被访问的用户ID
let customerid = ref(route.query.customerid);

// const vConsole = new VConsole();

console.warn("env", import.meta.env.VITE_BASE_URL);

/**
 * 微信授权和用户登录
 */
wxAuthorizeLogin();

/**
 * 日期切换
 */

const nowTime = new Date();
const fixedTime = new Date(set_changeDate.value).setHours(6, 0, 0, 0);
const startTime = ref(fixedTime - oneDayTimeStamp);
const endTime = ref(fixedTime);
const startTimeComputed = computed(() => {
  return formatDate({
    format: "yyyy-MM-dd",
    date: startTime.value,
  });
});
const endTimeComputed = computed(() => {
  return formatDate({ format: "yyyy-MM-dd", date: endTime.value });
});

const dateBackRef = ref();
function dateBack() {
  fromEvent(dateBackRef.value, "click")
    .pipe(throttleTime(700))
    .subscribe({
      next: (res) => {
        startTime.value = startTime.value - oneDayTimeStamp;
        endTime.value = endTime.value - oneDayTimeStamp;
        set_changeDate.value = endTime.value;

        getVCAData();

        getBloodPressure();
      },
    });
}
const dateForwardRef = ref();
function dateForward() {
  fromEvent(dateForwardRef.value, "click")
    .pipe(
      // switchMap(() =>
      //   iif(
      //     () => endTime.value + oneDayTimeStamp >= nowTime.getTime(),
      //     throwError("aaa"),
      //     of("错了")
      //   )
      // ),
      throttleTime(700)
    )
    .subscribe({
      next: (res) => {
        console.log(res);
        startTime.value = startTime.value + oneDayTimeStamp;
        endTime.value = endTime.value + oneDayTimeStamp;
        set_changeDate.value = endTime.value;
        getVCAData();
        getBloodPressure();
      },
      error: (err) => {
        console.log(err);
      },
    });
}

/**
 * 获取血压vca评语
 */
let vcaComment = ref({ bloodPressure: "" });
function getVCAData() {
  getBriefLogsData({
    customerid: customerid.value,
    time: endTime.value,
  }).subscribe({
    next: (res: any) => {
      let { code, data } = res;
      if (code === 0) {
        vcaComment.value = data[0];
      } else {
        vcaComment.value = { bloodPressure: "" };
      }
    },
    error: (err: any) => {
      console.log(err);
      vcaComment.value = { bloodPressure: "" };
    },
  });
}

/**
 * 血压图表数据
 */
let highPressure = ref(highDefaultArr);
let lowPressure = ref(lowDefaultArr);
let bp_amount = ref<number | string>("--");

let BPChartsOption = ref({
  title: {
    text: "数据请求中...",
    x: "center",
    y: "center",
    textStyle: {
      color: "#3c4767",
      fontWeight: "normal",
      fontSize: 16,
    },
  },
});
function getBloodPressure() {
  let r_params = {
    timeFrom: startTime.value,
    timeTo: endTime.value,
    customerid: customerid.value,
  };

  // 判断结束日期是否是今天，是的话接口结束日期得是当前时间
  let sameDayStartTimeStamp = nowTime.setHours(0, 0, 0, 0),
    sameDayEndTimeStamp = nowTime.setHours(23, 59, 59);
  if (
    endTime.value > sameDayStartTimeStamp &&
    endTime.value < sameDayEndTimeStamp
  ) {
    r_params = { ...r_params, timeTo: Date.now() };
  }

  getBloodPressureData(r_params).subscribe({
    next: (res: any) => {
      let { highArr, lowBPArr, response } = res,
        bpArr = Object.values(response?.data?.bloodPressures).flat();
      highPressure.value = highArr;
      lowPressure.value = lowBPArr;
      bp_amount.value = bpArr.length > 0 ? bpArr.length : "--";

      let data = chartbloodPressure.createNewBloodPressure(
        response,
        startTime.value,
        r_params.timeTo,
        new Date(endTime.value).setHours(0, 0, 0, 0)
      );

      BPChartsOption.value = data as any;
    },
    error: (err: any) => {
      BPChartsOption.value = {
        title: {
          text: "数据请求失败",
          x: "center",
          y: "center",
          textStyle: {
            color: "#3c4767",
            fontWeight: "normal",
            fontSize: 16,
          },
        },
      };
      console.log(err);
    },
  });
}

/**
 * 订阅BehaviorSubject
 * 当登录成功后，next()发送消息，此处订阅观察者发送的消息并执行请求获取数据。
 */
sessionIdSubject$.subscribe({
  next: (res) => {
    console.warn("subject", res);
    if (res.implement) {
      // 获取血压vca评语
      getVCAData();

      //获取血压数据
      getBloodPressure();
    }
  },
});

onMounted(() => {
  // testFun1();
  // 日期往前操作
  dateBack();

  // 日期往后操作
  dateForward();

  // 替换当前页面的URL连接。目的是为了刷新页面或返回到此页重新获取code
  handleURLParams();

  testSubject$.subscribe({
    next: (res) => {
      console.log(res);
    },
  });
});

onUnmounted(() => {
  sessionIdSubject$.complete();
});
function testFun() {
  console.log(userInfo);
  // set_sessionIdStore.value = "";
  // userInfo.$reset();
  userInfo.setUserData("");
}
</script>

<template>
  <div class="user_report">
    <div class="report_title" @click="testFun">精准看护｜血压监测简报</div>
    <div class="user_info">
      <div class="logo"></div>
      <div class="info">
        <div class="name">user name：xxx</div>
        <div class="mac">血压计MAC：xxxxxxxxxxxxx</div>
        <div class="vpas_id">关联VPAS ID：xxxxxxxxxx</div>
      </div>
    </div>
    <div class="report_data">
      <div class="rd_title">数据采集时间跨度</div>
      <div class="rd_date">
        <img
          ref="dateBackRef"
          class="date_icon"
          src="../static/images/time_left.png"
          alt=""
        />
        <div>{{ startTimeComputed }}:6am -- {{ endTimeComputed }}:6am</div>
        <img
          ref="dateForwardRef"
          class="date_icon"
          src="../static/images/time_right.png"
          alt=""
        />
      </div>
      <div class="profile">
        <div class="title">血压跟踪简述</div>
        <div class="content">{{ vcaComment.bloodPressure }}</div>
      </div>
      <div class="rd_bp_num">血压采集数：{{ bp_amount }}</div>
      <div class="bp_echarts">
        <chart :option="BPChartsOption"></chart>
      </div>

      <div class="rd_bp_num">血压分级统计说明</div>
      <div class="pressure">高压(收缩压)</div>
      <table class="table_data">
        <tr>
          <th class="first_td">等级</th>
          <th>范围值</th>
          <th>采集数</th>
          <th>分类百分比</th>
        </tr>
        <template v-for="(item, index) in highPressure" :key="index">
          <tr>
            <td class="first_td">
              <div class="flex">
                <span class="status_content">{{ item.grade }}</span>
                <span
                  :style="'background:' + item.grade_color"
                  class="status_color"
                ></span>
              </div>
            </td>
            <td>{{ item.range }}</td>
            <td>{{ item.count }}</td>
            <td>{{ item.percentage }}</td>
          </tr>
        </template>
      </table>
      <div class="pressure">低压(舒张压)</div>
      <table class="table_data">
        <tr>
          <th class="first_td">等级</th>
          <th>范围值</th>
          <th>采集数</th>
          <th>分类百分比</th>
        </tr>
        <template v-for="(item, index) in lowPressure" :key="index">
          <tr>
            <td class="first_td">
              <div class="flex">
                <span class="status_content">{{ item.grade }}</span>
                <span
                  :style="'background:' + item.grade_color"
                  class="status_color"
                ></span>
              </div>
            </td>
            <td>{{ item.range }}</td>
            <td>{{ item.count }}</td>
            <td>{{ item.percentage }}</td>
          </tr>
        </template>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../sass/public.scss";

.textCenter {
  text-align: center;
}

.user_report {
  padding: 0px 10px;
  background-image: url("../static/images/background.jpg");
  background-size: cover;
}
.report_title {
  font-size: 21px;
  font-weight: 700;
  color: #108993;
  @extend .textCenter;
  padding: 30px 0px;
}
.user_info {
  display: flex;
  justify-content: space-around;
  .logo {
    width: 100px;
    height: 100px;
    background: #ccc;
    border-radius: 75px;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    font-weight: 700;
    .name {
    }
    .mac {
    }
    .vpas_id {
    }
  }
}

.report_data {
  padding-bottom: 30px;
  .rd_title {
    margin: 26px 0 4px 0;
    @extend .textCenter;
    font-size: 16px;
  }
  .rd_date {
    @include flexible-box(space-around, center);
    .date_icon {
      width: 36px;
      height: 36px;
    }
  }

  .rd_bp_num {
    font-weight: 700;
    font-size: 17px;
    @extend .textCenter;
  }
  .bp_echarts {
    width: 100%;
    height: 300px;
  }

  .pressure {
    font-weight: 700;
    font-size: 15px;
    margin: 10px 0 2px;
  }
  .table_data {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    tr {
      height: 35px;
    }
    th {
      // background: #fafafa;
    }
    .first_td {
      width: 40%;
      text-align: left;
      padding: 0 10px;
      .flex {
        @include flexible-box(space-between, center);
        .status_content {
          flex: 0 1 35%;
        }
        .status_color {
          flex: 1;
          height: 11px;
          border-radius: 75px;
          display: block;
        }
      }
    }
    td,
    th {
      border: 1px solid #ccc;
      text-align: center;
    }
  }
}

.profile {
  padding: 20px 0;

  .title {
    font-weight: 700;
    font-size: 17px;
    margin-bottom: 7px;
    @extend .textCenter;
  }
  .content {
  }
}
</style>
