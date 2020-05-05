<template>
  <div class="login-container">
    <div class="login-head"><img src="./logo_index.png" alt=""></div>
    <el-form class="login-form" ref="login-form" :model="user" :rules="formRules">
  <el-form-item prop="mobile">
    <el-input
    v-model="user.mobile"
    placeholder="请输入手机号"
    ></el-input>
  </el-form-item>
  <el-form-item prop="code">
    <el-input
    v-model="user.code"
    placeholder="请输入验证码"
    ></el-input>
  </el-form-item>
  <el-form-item prop="agree">
    <el-checkbox v-model="user.agree">我已阅读并同意用户协议和隐私条款</el-checkbox>
  </el-form-item>
  <el-form-item>
    <el-button class="login-btn" type="primary" @click="onLogin()" :loading="loginLoading">登录</el-button>
  </el-form-item>
</el-form>
  </div>
</template>

<script>
import { login } from '@/api/user'
export default {
  name: 'LoginIndex',
  components: {},
  props: {},
  data () {
    return {
      user: {
        mobile: '', // 手机号
        code: '', // 验证码
        agree: false
      },
      checked: false,
      loginLoading: false,
      formRules: { // 表单验证规则
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'change' },
          { pattern: /^1[3|5|7|8|9]\d{9}$/, message: '请输入正确的号码格式', trigger: 'change' }
        ],
        code: [
          { required: true, message: '验证码不能为空', trigger: 'change' },
          { pattern: /^\d{6}$/, message: '请输入正确的验证码格式' }
        ],
        agree: [
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('请同意用户协议'))
              }
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    onLogin () {
      // 获取表单数据
      // const user = this.user
      // 验证表单信息
      this.$refs['login-form'].validate(valid => {
        if (!valid) {
          return
        }
        this.login()
      })
    },
    login () {
      this.loginLoading = true
      // 提交表单数据
      login(this.user).then(res => {
        this.$message({
          message: '登陆成功',
          type: 'success'
        })
        // 关闭login
        this.loginLoading = false
        // 讲token保存到本地存储
        window.localStorage.setItem('user', JSON.stringify(res.data.data))
        // 跳转到首页
        this.$router.push({
          name: 'home'
        })
      }).catch(() => {
        this.loginLoading = false
        this.$message.error('登陆失败，用户名或密码错误')
      })
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url("./login_bg.jpg") no-repeat;
  background-size: cover;
  .login-head {
    width: 300px;
    height: 57px;
    padding: 10px 50px 0 ;
    text-align: center;
    // background: url("./logo_index.png") no-repeat;
    background-color: #fff;
    img {
      width: 200px;
    }
  }
  .login-form {
    background-color: #fff;
    padding: 10px 50px;
    min-width: 300px;
    .login-btn {
      width: 100%;
    }
  }
}
</style>
