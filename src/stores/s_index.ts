import { toRaw } from "vue";
import { createPinia, PiniaPluginContext, storeToRefs } from "pinia";
import { from, filter, map, toArray, of } from "rxjs";
import { create } from "rxjs-spy";
// Rxjs调试
import { tag } from "rxjs-spy/operators/tag";
const spy = create();
console.log(spy);

// 设置本地数据存储
const setStorage = (key: string, value: any) => {
  // let obj = {};
  // for (const [k, v] of Object.entries(value)) {
  //   // obj = Object.assign(obj, { [k]: (v as any).value });

  //   // 带有固定字符开头的store才存入本地
  //   if (k.startsWith("set_")) {
  //     obj = Object.assign(obj, { [k]: (v as any).value });
  //   }
  // }
  // console.log(obj);
  // sessionStorage.setItem(key, JSON.stringify(obj));

  const observableValue: Array<string | any> = Object.entries(value);

  from(observableValue)
    .pipe(
      // 带有固定字符开头的store才存入本地
      filter(([k, v]: any) => k.startsWith("set_")),
      map(([k, v]: any) => ({ [k]: (v as any).value })),
      // 收集所有源发射，并在源完成时将它们作为数组发射。
      toArray(),
      map((res: any) => JSON.stringify(Object.assign({}, ...res)))
    )
    .subscribe({
      next: (res: any) => {
        sessionStorage.setItem(key, res);
      },
      error: (err) => {
        sessionStorage.removeItem(key);
      },
    });
};

// 获取本地数据
const getStorage = (key: string) => {
  return sessionStorage.getItem(key)
    ? JSON.parse(sessionStorage.getItem(key) as string)
    : {};
};

type Options = {
  key?: string;
};

// 本地存储的键
const __piniaKey__: string = "defaultKey";

// pinia状态持久化插件
const piniaPlugin = (options: Options) => {
  return ({ store }: PiniaPluginContext) => {
    const data = getStorage(`${store.$id}`);

    store.$subscribe(() => {
      // ${options?.key ?? __piniaKey__}_${store.$id}
      setStorage(`${store.$id}`, toRaw(store.$state));
    });

    return {
      ...data,
    };
  };
};
const pinia = createPinia();

pinia.use(piniaPlugin({ key: "pinia" }));

pinia.use(({ store }: PiniaPluginContext) => {
  store.$reset = () => {
    const initialState = JSON.parse(JSON.stringify(store.$state));
    from(Object.entries(initialState))
      .pipe(
        map(([key, value]: any) => ({ [key]: "" })),
        toArray(),
        // tag("aaaa"),
        map((res: any) => Object.assign({}, ...res))
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);
          store.$patch(res);
          // spy.show("aaaa");
        },
      });
  };
});

export default pinia;
