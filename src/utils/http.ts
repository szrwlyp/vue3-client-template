import {
  Observable,
  retry,
  timer,
  catchError,
  switchMap,
  throwError,
  of,
  OperatorFunction,
  RetryConfig,
  ObservableInput,
  ObservedValueOf,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { HttpParameter, HttpMethod } from "../types/http";
import { useUserInfoStore } from "@/stores/user_info";
import { storeToRefs } from "pinia";

const userInfo = useUserInfoStore();

const { set_sessionIdStore } = storeToRefs(userInfo);

/**
 * Http状态码有：1xx，2xx，3xx，4xx，5xx。
 * 根据状态码第一个字符来执行相应的函数。函数内部还能具体，比如：403，404等等。
 */
const HttpStatus = new Map([
  [
    "1",
    (subscriber: any, res: any) => {
      subscriber.next(res);
      subscriber.complete();
    },
  ],
  [
    "2",
    (subscriber: any, res: any) => {
      subscriber.next(res);
      subscriber.complete();
    },
  ],
  [
    "3",
    (subscriber: any, res: any) => {
      subscriber.next(res);
      subscriber.complete();
    },
  ],
  [
    "4",
    (subscriber: any, res: any) => {
      subscriber.next(res);
      subscriber.complete();
    },
  ],
  [
    "5",
    (subscriber: any, err: any) => {
      subscriber.error(err);
      subscriber.complete();
    },
  ],
  [
    "error",
    (subscriber: any, err: any) => {
      subscriber.error(err);
      subscriber.complete();
    },
  ],
]);

export default class Http {
  private base_url = import.meta.env.VITE_BASE_URL;
  private url = "";
  private data = {};
  private method = HttpMethod.GET;
  private header = {
    "content-type": "application/json",
  };

  constructor(parameter: HttpParameter) {
    const { data, url, method } = parameter;
    this.data = data;
    this.url = url;
    this.method = method;
  }

  public request() {
    const { base_url, url, data, method, header } = this;
    return ajax({
      url: base_url + url,
      method,
      headers: header,
      body: { ...data, sessionid: set_sessionIdStore.value ?? "" },
    }).pipe(
      switchMap((res) =>
        res.status === 200
          ? of(res.response)
          : throwError(() => new Error("响应状态非200"))
      ),
      // catchError((error, caught$) => {
      //   console.log("error: ", error);
      //   throw error;
      // }),
      retry({
        count: 2,
        delay: (_error: any, retryCount: number): ObservableInput<any> => {
          console.warn(
            `第${retryCount}次重试。重试的时间间隔${Math.pow(2, retryCount)}秒`
          );

          const random_number_milliseconds = Math.floor(Math.random() * 1000);
          console.log(
            Math.pow(2, retryCount) * 1000 + random_number_milliseconds
          );
          // 返回再次执行的通知函数（必须）
          return timer(Math.pow(2, retryCount) * 1000);
        },
      } as RetryConfig)
    );

    // return new Observable((subscriber) => {
    //   fetch(base_url + url, {
    //     method, // *GET, POST, PUT, DELETE, etc.
    //     mode: "cors", // no-cors, *cors, same-origin
    //     cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //     credentials: "same-origin", // include, *same-origin, omit
    //     headers: header,
    //     redirect: "follow", // manual, *follow, error
    //     referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //     body: JSON.stringify(data), // body data type must match "Content-Type" header
    //   })
    //     .then((response) => {
    //       const { status, ok, statusText } = response;
    //       console.warn("接口请求：", response);
    //       // if (status >= 200 && status < 300) {
    //       //   return response.json();
    //       // } else {
    //       //   subscriber.error({ status, statusText, ok, url });
    //       // }
    //     })
    //     .then((result) => {
    //       // subscriber.next(result);
    //       // observer.complete()
    //     })
    //     .catch((error) => {
    //       // subscriber.error(error);
    //     });
    //   // subscriber.next(1);
    //   // subscriber.complete();
    //   //   const statusToString = res.statusCode.toString(),
    //   //     firstStr = statusToString.charAt(0);

    //   //   if (HttpStatus.has(firstStr)) {
    //   //     HttpStatus.get(firstStr)!(subscriber, res);
    //   //   } else {
    //   //     HttpStatus.get("error")!(subscriber, res);
    //   //   }
    // }).pipe(
    //   retry({
    //     count: 2,
    //     delay: (_error, retryCount) => {
    //       console.warn(
    //         `第${retryCount}次重试。重试的时间间隔${Math.pow(2, retryCount)}秒`
    //       );

    //       const random_number_milliseconds = Math.floor(Math.random() * 1000);
    //       console.log(
    //         Math.pow(2, retryCount) * 1000 + random_number_milliseconds
    //       );
    //       // 返回再次执行的通知函数（必须）
    //       return timer(Math.pow(2, retryCount) * 1000);
    //     },
    //   })
    // );
  }
}
