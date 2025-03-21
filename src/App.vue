<template>
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <!-- 添加全局Toast组件 -->
  <Toast />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Toast from './components/common/Toast.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Toast
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}
</style>
