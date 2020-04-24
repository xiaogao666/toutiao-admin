import axios from 'axios'
import JSONbig from 'json-bigint'

// 创建一个axios实例
const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/',

  // 定义后端返回原始数据的处理
  // data 是后端返回的原始数据 未经处理的json格式的字符串
  transformResponse: [function (data) {
    // 后端返回的数据可能不是 JSON 格式字符串
    // 如果不是的话，那么 JSONbig.parse 调用就会报错
    // 所以我们使用 try-catch 来捕获异常，处理异常的发生
    try {
      // 如果转换成功，则直接把结果返回
      return JSONbig.parse(data)
    } catch (err) {
      console.log('转换失败', err)
      // 如果转换失败了，则进入这里
      // 我们在这里把数据原封不动的直接返回给请求使用
      return data
    }
  }]
})

// 请求拦截器
request.interceptors.request.use(
  // 任何请求都会经过这里
  function (config) {
    const user = JSON.parse(window.localStorage.getItem('user'))

    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  // 请求失败会经过这里
  function (error) {
    return Promise.reject(error)
  }
)

export default request
