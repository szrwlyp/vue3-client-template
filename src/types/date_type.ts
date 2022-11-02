/**
 * 格式化时间类型
 * @param format 进行格式化的模式字符串
 * @param timeStamp 要格式化的日期
 */
export interface FormatDate {
  format: string;
  date: number | Date;
}
