import Vue from 'vue'
import App from './App.vue'
import forEach from 'lodash/forEach'

// import '@curupira/grid-system/dist/main.css'
// import '@curupira/vue-components-ui/dist/curupira-ui.css'
import UI from './entry.js'
import { SvgIcon } from './entry.js'
Vue.use(UI)
Vue.use(SvgIcon, {
  tagName: 'icon'
})

Vue.config.productionTip = false

// // AUTOMATIC LOAD ALL COMPONENTS.
// // TODO - only temporary, create a async or manual method in the end
// function requireAllComponents (requireContext) {
//   var keys = requireContext.keys()
//   forEach(keys, k => {
//     var modulo = requireContext(k)
//     var nome = k.match(/([^/]*).vue$/)
//     Vue.component(nome[1], modulo.default || modulo)
//   })
// }
// requireAllComponents(require.context('./components', true, /[A-Za-z]\w+\.(vue)$/))



new Vue({
  render: h => h(App)
}).$mount('#app')
