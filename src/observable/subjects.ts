import { Subject, BehaviorSubject } from "rxjs";

interface sessionIdSubject$Type {
  implement: boolean;
  session_id?: string;
}
/**
 * 监听用户登录后的sessionId
 */
export const sessionIdSubject$ = new BehaviorSubject<sessionIdSubject$Type>({
  implement: false,
  session_id: "",
});

export const testSubject$ = new Subject<number>();

export const testFun1 = function () {
  setInterval(() => {
    testSubject$.next(1);
  }, 2000);
};
