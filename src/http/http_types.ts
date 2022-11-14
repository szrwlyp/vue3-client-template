/**
 * http请求方法枚举
 */
export enum HttpMethod {
  GET = "GET",
  get = "GET",
  POST = "POST",
  post = "POST",
  DELETE = "DELETE",
  delete = "DELETE",
  PUT = "PUT",
  put = "PUT",
}

export interface HttpAttribute {
  base_url: string;
  url: string;
  data: any;
  method: HttpMethod;
  header: any;
  request: any;
}

export interface HttpParameter {
  data: any;
  url: string;
  method: HttpMethod;
}
