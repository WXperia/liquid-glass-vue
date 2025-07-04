import { createApp } from 'vue'
import LiquidGlass from './lib'
import BaseUsage from './BaseUsage.vue'
import './index.css'
createApp(BaseUsage).use(LiquidGlass).mount('#app')
