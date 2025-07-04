<script setup lang="ts">
import GlassContainerV2 from './lib/components/GlassContainerV2.vue';
import unravel from '@/assets/unravel.png';
</script>
<template>
  <div class="w-full h-full main-container" :style="{ background: `url(${unravel}) no-repeat center top` }">
    <GlassContainerV2 class="glass-container">
      <div class="glass-content">
        <h1>Base Useage</h1>
        <div class="glass-content-item">
          <h2>Liquid Glass</h2>
          <p>Liquid Glass is a component that allows you to create a liquid glass effect on your website.</p>
        </div>
      </div>
    </GlassContainerV2>
  </div>
</template>
<style scoped>
.main-container {
  overflow: hidden;
  background-color: #000;
  width: 100vw;
  height: 100vh;

  background-size: cover;
}

.glass-container {
  color: white;
  margin: 300px auto;

}

.glass-content {
  padding: 24px 32px;
  border-radius: 10px;
}
</style>
