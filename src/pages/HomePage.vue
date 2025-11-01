<template>
  <div class="home">
    <HeaderMain />
    <InteractiveTimeline />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderMain from './HeaderMain.vue'
import InteractiveTimeline from './InteractiveTimeline.vue'


const message = ref<string>('67')
console.log(message.value)
</script>

<style scoped>
.home {

  min-height: 100vh;
  background-color: #FCA311 ;
  color: #14213D;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

</style>
