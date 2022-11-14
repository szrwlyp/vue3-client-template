import {
  Observable,
  retry,
  timer,
  catchError,
  switchMap,
  throwError,
  of,
  defer,
  tap,
  iif,
  RetryConfig,
  ObservableInput,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { HttpParameter, HttpMethod } from "./http_types";
import { wxAuthorizeLogin } from "@/utils/u_wx_fun";
import { useUserInfoStore } from "@/stores/user_info";
import { storeToRefs } from "pinia";

const userInfo = useUserInfoStore();

const { set_sessionIdStore } = storeToRefs(userInfo);

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
      // tap((res) => {
      //   console.log("tap++++++", res);
      // }),
      switchMap(({ status, response }: any) =>
        iif(
          () => status === 200,
          iif(
            () => response.code === 0,
            of(response),
            defer(() => {
              // 接口返回登录失败
              if (response.code === -3) {
                // 清空用户数据和sessionId
                userInfo.$reset();
                return of(wxAuthorizeLogin());
              } else {
                return of(response);
              }
            })
          ),
          throwError(() => new Error("请求状态非200"))
        )
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
  }
}
