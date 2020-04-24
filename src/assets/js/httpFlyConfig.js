import { envConfig } from '@/env/index'
let host = envConfig.API // 主机地址，

export default {
  // 请求url前缀
  baseURL: host,
  // 请求头信息
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  // 请求参数
  body: {},
  // 超时时间
  timeout: 20000,
  // 携带凭证
  withCredentials: true
}
