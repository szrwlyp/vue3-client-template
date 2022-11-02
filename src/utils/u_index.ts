/**
 * 处理URL中的对象并修改当前页面的URL。
 * 案例：
 * 1.处理微信授权登录回调并已使用code后页面URL还存在code。
 */
export function handleURLParams(): void {
  const { protocol, host, pathname, search, hash = "" } = window.location;

  let url = `${protocol}//${host}${pathname}${hash}`;

  // console.log(window.location);

  const urlParams = new URLSearchParams(search);
  urlParams.delete("code");
  urlParams.delete("state");

  const urlToStr = urlParams.toString();

  urlToStr && (url = url + `?${decodeURIComponent(urlToStr)}`);

  history.replaceState(null, "", url);
}
