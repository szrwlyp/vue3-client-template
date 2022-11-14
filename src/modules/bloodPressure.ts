import { map, catchError, of, tap } from "rxjs";
import Http from "@/http/http";
import { HttpParameter, HttpMethod } from "@/http/http_types";

/**
 * 血压数据处理参数接口
 */
interface ParamsHandle {
  dataArrLength: number;
  highItem: any;
  resultArr: Array<any>;
  handleArr: Array<any>;
  high_range?: number;
  low_range?: number;
  high_str?: string;
  low_str?: string;
}

/**
 * 高低血压默认值类型
 */
export interface HighLowDefaultType {
  grade: string;
  grade_color: string;
  range: string;
  count: string;
  percentage: string;
}

/**
 * 高压默认值
 */
export const highDefaultArr: Array<HighLowDefaultType> = [
  {
    grade: "正常",
    grade_color: "rgb(142, 250, 0)",
    range: "<120",
    count: "--",
    percentage: "--",
  },
  {
    grade: "偏高",
    grade_color: "rgb(255, 251, 0)",
    range: "120-129",
    count: "--",
    percentage: "--",
  },
  {
    grade: "高",
    grade_color: "rgb(255, 147, 0)",
    range: "130-139",
    count: "--",
    percentage: "--",
  },
  {
    grade: "极高",
    grade_color: "rgb(255, 38, 0)",
    range: "140-180",
    count: "--",
    percentage: "--",
  },
  {
    grade: "风险",
    grade_color: "rgb(148, 17, 0)",
    range: ">180",
    count: "--",
    percentage: "--",
  },
];

/**
 * 低压默认值
 */
export const lowDefaultArr: Array<HighLowDefaultType> = [
  {
    grade: "正常",
    grade_color: "rgb(142, 250, 0)",
    range: "<80",
    count: "--",
    percentage: "--",
  },
  {
    grade: "偏高",
    grade_color: "rgb(255, 251, 0)",
    range: "<80",
    count: "--",
    percentage: "--",
  },
  {
    grade: "高",
    grade_color: "rgb(255, 147, 0)",
    range: "80-90",
    count: "--",
    percentage: "--",
  },
  {
    grade: "极高",
    grade_color: "rgb(255, 38, 0)",
    range: "90-120",
    count: "--",
    percentage: "--",
  },
  {
    grade: "风险",
    grade_color: "rgb(148, 17, 0)",
    range: ">120",
    count: "--",
    percentage: "--",
  },
];
function handleHighLowData(params: ParamsHandle): any {
  const {
    dataArrLength,
    handleArr,
    highItem,
    resultArr,
    high_range,
    low_range,
    high_str,
    low_str,
  } = params;

  const filterArr: Array<any> = handleArr.filter((item) => {
    // @ts-ignore
    if (low_str && low_str === "<") return item < low_range;

    if (low_str && low_str === ">=" && high_str && high_str === "<=")
      // @ts-ignore
      return item >= low_range && item <= high_range;

    // @ts-ignore
    if (high_str && high_str === ">") return item > high_range;
  });
  // console.warn('按等级过滤数据：',filterArr);

  resultArr.push({
    ...highItem,
    count: filterArr.length > 0 ? filterArr.length : "--",
    percentage:
      filterArr.length > 0
        ? Math.trunc((filterArr.length / dataArrLength) * 100) + "%"
        : "--",
  });
}

// 处理血压数据
function handleBloodPressureData(res: any, vpas_id: string): any {
  const { code, data } = res,
    highArr: Array<any> = [],
    lowBPArr: Array<any> = [],
    allHighArr: Array<number> = [], //所有的高压数据
    allLowArr: Array<number> = []; //所有的低压数据

  if (code === 0) {
    // 获取键值对中所有的值（是数组），然后拉平。
    // console.log(Object.values(data?.bloodPressures).flat());
    const dataArr = vpas_id
      ? data?.bloodPressures[vpas_id]
      : Object.values(data?.bloodPressures).flat();
    dataArr.forEach((item: any) => {
      const high = item.high,
        low = item.low;

      allHighArr.push(high);
      allLowArr.push(low);
    });

    // 高压数据遍历
    highDefaultArr.forEach((item, index) => {
      switch (index) {
        case 0:
          handleHighLowData({
            highItem: item,
            resultArr: highArr,
            handleArr: allHighArr,
            low_range: 120,
            low_str: "<",
            dataArrLength: dataArr.length,
          });
          break;
        case 1:
          handleHighLowData({
            highItem: item,
            resultArr: highArr,
            handleArr: allHighArr,
            low_range: 120,
            low_str: ">=",
            high_range: 129,
            high_str: "<=",
            dataArrLength: dataArr.length,
          });
          break;
        case 2:
          handleHighLowData({
            highItem: item,
            resultArr: highArr,
            handleArr: allHighArr,
            low_range: 130,
            low_str: ">=",
            high_range: 139,
            high_str: "<=",
            dataArrLength: dataArr.length,
          });
          break;
        case 3:
          handleHighLowData({
            highItem: item,
            resultArr: highArr,
            handleArr: allHighArr,
            low_range: 140,
            low_str: ">=",
            high_range: 180,
            high_str: "<=",
            dataArrLength: dataArr.length,
          });
          break;
        case 4:
          handleHighLowData({
            highItem: item,
            resultArr: highArr,
            handleArr: allHighArr,
            high_range: 180,
            high_str: ">",
            dataArrLength: dataArr.length,
          });
          break;
      }
    });

    // 低压数据遍历
    lowDefaultArr.forEach((item, index) => {
      switch (index) {
        case 0:
          handleHighLowData({
            highItem: item,
            resultArr: lowBPArr,
            handleArr: allLowArr,
            low_range: 80,
            low_str: "<",
            dataArrLength: dataArr.length,
          });
          break;
        case 1:
          lowBPArr.push(item);
          // handleHighLowData({
          //   highItem: item,
          //   resultArr: lowBPArr,
          //   handleArr: allLowArr,
          //   low_range: 80,
          //   low_str: "<",
          //   dataArrLength: dataArr.length,
          // });
          break;
        case 2:
          handleHighLowData({
            highItem: item,
            resultArr: lowBPArr,
            handleArr: allLowArr,
            low_range: 80,
            low_str: ">=",
            high_range: 90,
            high_str: "<=",
            dataArrLength: dataArr.length,
          });
          break;
        case 3:
          handleHighLowData({
            highItem: item,
            resultArr: lowBPArr,
            handleArr: allLowArr,
            low_range: 90,
            low_str: ">=",
            high_range: 120,
            high_str: "<=",
            dataArrLength: dataArr.length,
          });
          break;
        case 4:
          handleHighLowData({
            highItem: item,
            resultArr: lowBPArr,
            handleArr: allLowArr,
            high_range: 120,
            high_str: ">",
            dataArrLength: dataArr.length,
          });
          break;
      }
    });
    return { highArr, lowBPArr, response: res };
  }
}

/**
 * 获取用户血压数据
 * @return Observable
 */
export function getBloodPressureData(
  data: any,
  vpas_id?: string | undefined
): any {
  const params: HttpParameter = {
    data,
    url: "/vpas/radar-server/wxSubscribeService/getCustomerBloodPressure",
    method: HttpMethod.POST,
  };
  return new Http(params).request().pipe(
    //捕获错误，重播返回空数据。
    catchError((error, caught$) =>
      of({ code: 0, data: { bloodPressures: [] } })
    ),
    map((res: any) => handleBloodPressureData(res, vpas_id || ""))
  );
}

/**
 * 获取用户血压vca评语
 * @return Observable
 */
export function getBriefLogsData(data: any) {
  const params: HttpParameter = {
    data,
    url: "/vpas/radar-server/vcaOperationService/getCustomerBriefLogs",
    method: HttpMethod.POST,
  };
  return new Http(params).request();
}
