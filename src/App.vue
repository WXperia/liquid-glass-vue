<script setup lang="ts">
import LiquidGlass from './lib/components/LiquidGlass.vue'

</script>

<template>
  <main class="container">
    <LiquidGlass :style="{
      position: 'fixed',
      top: '25%',
      left: '40%',
    }">
      <div class="wrapper">
        <h1>Hello World</h1>
      </div>
    </LiquidGlass>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: url('./assets/unravel.png') no-repeat center center;
}
</style>
