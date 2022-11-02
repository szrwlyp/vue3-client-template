import type { FormatDate } from "../types/date_type";
/**
 * 格式化时间，日期函数
 * @param {date} 要格式化的日期
 * @param {format} 进行格式化的模式字符串
 */
export function formatDate(params: FormatDate): string {
  const { format, date } = params,
    dateInstance = new Date(date),
    o: any = {
      "M+": dateInstance.getMonth() + 1, //月份
      "d+": dateInstance.getDate(), //日
      "h+": dateInstance.getHours(), //小时
      "m+": dateInstance.getMinutes(), //分
      "s+": dateInstance.getSeconds(), //秒
      "q+": Math.floor((dateInstance.getMonth() + 3) / 3), //季度
      S: dateInstance.getMilliseconds(), //毫秒
    };

  let handleStr: string = "";
  if (/(y+)/.test(format)) {
    handleStr = format.replace(
      RegExp.$1,
      (dateInstance.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  for (const k in o) {
    if (new RegExp("(" + k + ")").test(handleStr)) {
      handleStr = handleStr.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return handleStr;
}

/**
 * 一天的时间戳
 */
export const oneDayTimeStamp = 24 * 60 * 60 * 1000;
