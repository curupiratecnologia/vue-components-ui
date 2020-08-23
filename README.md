# Components UI

A series of component used in our projects in curupira tecnologia

[DOCUMENTATION](https://curupiratecnologia.github.io/vue-components-ui)


## Install
```
npm install @curupira/vue-components-ui
```

### Use all components
```
import UI from '@curupira/vue-components-ui'
import '@curupira/vue-components-ui/dist/curupira-ui.css'
import { SvgIcon } from '@curupira/vue-components-ui'
Vue.use(SvgIcon, {
  tagName: 'icon'
})
Vue.use(UI)
```


### Use individual components

#### Global
```
import { DataLoader, Dropdown } from '@curupira/vue-components-ui'

Vue.components(curupiraUi)

```

#### In a component
```
import { DataLoader, Dropdown } from '@curupira/vue-components-ui'

export default{
    components:{DataLoader,Dropdown }
}

```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
