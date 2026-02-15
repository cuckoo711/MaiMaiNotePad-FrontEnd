<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2>麦麦笔记本</h2>
      <h3>登录</h3>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="left"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住用户名和密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
          <el-link type="primary" @click="$router.push('/register')" class="register-link">去注册</el-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'
import { handleApiError } from '@/utils/api'

const router = useRouter()
const loginFormRef = ref()
const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 从URL参数中获取注册信息
const getRegisterInfo = () => {
  const query = router.currentRoute.value.query
  if (query.username && query.password) {
    loginForm.value.username = query.username
    loginForm.value.password = query.password
  }
}

// 从localStorage获取记住的登录信息
const getRememberedInfo = () => {
  const remembered = localStorage.getItem('rememberedLogin')
  if (remembered) {
    const { username, password, remember } = JSON.parse(remembered)
    loginForm.value.username = username
    loginForm.value.password = password
    loginForm.value.remember = remember
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await login(loginForm.value.username, loginForm.value.password)
        
        if (response.success) {
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('refresh_token', response.data.refresh_token)
          
          if (loginForm.value.remember) {
            localStorage.setItem('rememberedLogin', JSON.stringify(loginForm.value))
          } else {
            localStorage.removeItem('rememberedLogin')
          }
          
          ElMessage.success('登录成功')
          router.push('/home')
        } else {
          ElMessage.error(response.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        const errorMessage = handleApiError(error, '登录失败，请检查网络连接')
        ElMessage.error(errorMessage)
      }
    } else {
      return false
    }
  })
}

onMounted(() => {
  getRegisterInfo()
  getRememberedInfo()
})
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-color);
}

.login-form-wrapper {
  width: 400px;
  padding: 40px;
  background-color: var(--card-background);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

h2 {
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 10px;
  font-size: 28px;
}

h3 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 18px;
  color: var(--text-color);
}

.login-btn {
  width: 100%;
  margin-bottom: 10px;
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.register-link {
  display: block;
  text-align: center;
}
</style>
