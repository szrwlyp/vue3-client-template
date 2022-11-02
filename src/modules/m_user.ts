import { switchMap, iif, throwError, of, Observable } from "rxjs";
import Http from "../utils/http";
import { HttpParameter, HttpMethod } from "../types/http";

/**
 * 微信用户登录
 */
export function wxLogin(data: any): Observable<any> {
  const params: HttpParameter = {
    data,
    url: "/api/wxService/snsLogin",
    method: HttpMethod.POST,
  };
  return new Http(params).request().pipe(
    switchMap((res: any) =>
      iif(
        () => res.code === 0,
        of(res.data),
        throwError(() => ({
          msg: res.msg ?? "登录失败，删除sessionId重新登录",
          reload: true,
        }))
      )
    )
  );
}
