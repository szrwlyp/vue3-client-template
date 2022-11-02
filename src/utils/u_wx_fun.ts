import { Observable, iif, of, tap, map } from "rxjs";
import { WX_APPID } from "@/config/index";
import { wxLogin } from "@/modules/m_user";
import { sessionIdSubject$ } from "@/observable/subjects";
import { useUserInfoStore } from "@/stores/user_info";
import { storeToRefs } from "pinia";

const userInfo = useUserInfoStore();

const { set_userDataStore, set_sessionIdStore } = storeToRefs(userInfo);

function jumpWX() {
  return new Observable((subscriber) => {
    subscriber.next({ msg: "微信授权", isUserData: false });
    subscriber.complete();
    window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX_APPID}&redirect_uri=${encodeURIComponent(
      window.location.href
    )}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`;
  });
}

/**
 * 微信授权登录
 */
export function wxAuthorizeLogin() {
  const { code } = Object.fromEntries(
    new URLSearchParams(window.location.search)
  );
  console.warn(
    "url参数",
    Object.fromEntries(new URLSearchParams(window.location.search))
  );
  console.warn("set_sessionIdStore", set_sessionIdStore.value);
  console.warn("set_userDataStore", set_userDataStore.value);

  iif(
    () => (!code && !set_sessionIdStore.value ? true : false),
    jumpWX(),
    iif(
      () => (set_userDataStore.value ? true : false),
      of({ ...set_userDataStore.value, isUserData: true }),
      wxLogin({ code, appid: WX_APPID }).pipe(
        map((res) => ({ ...res, isUserData: true }))
      )
    )
  ).subscribe({
    next: (res) => {
      const { isUserData } = res;
      if (isUserData) {
        userInfo.setUserData(res);
        set_sessionIdStore.value = res.sessionid;
        sessionIdSubject$.next({ implement: true, session_id: res.sessionid });
      }
    },
    error: (err) => {
      console.log(err);
      if (err.reload) {
        // 清空用户数据和sessionId
        userInfo.$reset();
        // 重新微信授权登录
        wxAuthorizeLogin();
      }
    },
  });
}
