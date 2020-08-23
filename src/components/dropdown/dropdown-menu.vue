<template>
<!-- TODO - repensar a logica de multiple totalmente -->
<!--  CONVERTER TO RENDER FUNCTON, TO PASS SCOPE SLOTS from dropdowmmenu to dropdown-menu-item -->
    <div  class="dropdown-menu"
          :style="{
                  maxHeight:myMaxHeight,
                  maxWidth:myMaxWidth,
                  width:myMaxWidth
                }">

          <div v-if="searchBar">
            <div class="search-bar">
              <div class="search-bar__icon">
                <icon name="icon-search" scale="0.9"></icon>
              </div>
              <input ref="input-search" class="search-bar__input" v-model="searchWord" placeholder="Buscar...">
              <div class="search-bar__clear" @click="searchWord=''">
                  <icon v-if="searchWord.trim()!=''" name="icon-close"></icon>
              </div>
            </div>
          </div>

           <!-- MENU WITH SEARCH RESULT -->
          <div v-if="searchWord.trim() !='' ">
              <template v-for="(option,i) in filteredOptions">
                   <dropdown-menu-item
                      :key="'search'+option.text+option.value+i"
                      :text="$get(option,'text')"
                      :keyName="$get(option,'key')"
                      :value="$get(option,'value')"
                      :multiple="$get(option,'multiple')"
                      :categoryText="option.categoryText"
                      :active="getActiveforOption(option)"
                      @clickAdd="addItem"
                      @clickRemove="removeItem"
                      @click="setItem"
                    >

                  </dropdown-menu-item>
                </template>
          </div>

          <!-- THE CURRENT MENU -->
          <div v-else>
            <template v-for="option in myOptions">

                <dropdown-menu-item
                      :key="option.text+option.value"
                      :keyName="getSubMenuKeyForOption(option) || keyName"
                      :text="$get(option,'text')"
                      :value="$get(option,'value')"
                      :multiple="multiple"
                      :options="$get(option,'options',false)"
                      :active="getActiveforOption(option)"
                      :chipsText="getTotalActiveforSubMenuOption(option)"
                      :submenu="$get(option,'submenu',false)"
                      @clickAdd="addItem"
                      @clickRemove="removeItem"
                      @click="setItem"
                  >

                </dropdown-menu-item>

            </template>
          </div>

    </div>
</template>

<script>
/**
   *
   *
   * @requiressss ./dropdown-menu-item.vue
 */

import has from 'lodash/has'
import get from 'lodash/get'
import set from 'lodash/set'
import isObject from 'lodash/isObject'
import Fuse from 'fuse.js'

export default {
  name: 'dropdown-menu',

  inject: { rootDropdown: { default: false } },

  provide: function () {
    return {
      rootDropdown: this.rootDropdown || this
    }
  },

  props: {
    /**
     Show search bar
    */
    searchBar: {
      type: Boolean,
      default: false
    },
    /**
    filter items with text
    */
    filter: {
      type: Boolean,
      default: false
    },
    /**
    KeyName to put object in
    */
    keyName: {
      type: [String, Number],
      default: undefined
    },
    /**
     Multiple selection
    */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * Items options, array with object with  {text,value, submenu:{ options, multiple } }
     * the array accept
     */
    options: {
      type: Array,
      default: () => ([{ text: 'lebel', value: 'value', submenu: { options: [], multiple: false } }])
    },

    maxHeight: {
      type: [Number, String],
      default: 250
    },

    maxWidth: {
      type: [Number, String],
      default: '100%'
    },

    /** @model */
    value: {}

  },

  data () {
    return {
      selectedValues: this.value,
      selectedItens: [],
      selected: {},
      searchWord: '',
      $get: get
    }
  },

  computed: {

    myMaxHeight: function () {
      let h = this.maxHeight
      if (typeof this.maxHeight === 'number') {
        h = this.maxHeight + 'px'
      }
      return h
    },

    myMaxWidth: function () {
      let w = this.maxWidth
      if (typeof this.maxWidth === 'number') {
        w = this.maxWidth + 'px'
      }
      return w
    },

    myOptions: function () {
      // set flat options to text,values
      let options = []
      if (typeof this.options[0] === 'number' || typeof this.options[0] === 'string') {
        options = this.options.map(options => ({ text: options, value: options }))
      } else {
        options = this.options
      }
      return options
    },

    filteredOptions: function () {
      const options = []

      const word = this.searchWord.trim()
      if (word !== '') {
        const search = this.fuse.search(word)

        if (search.length === 0) {
          return [{ text: ' --- sem resultado ---', categoryText: '', value: '' }]
        }
        return search.map(searchitem => searchitem.item)
      }

      return options
    },

    isSubmenu: function () {
      return this.rootDropdown !== false && this.rootDropdown !== this
    },

    rootMenu: function () {
      return this.rootDropdown || this
    },

    planarOptions: function () {
      const finalOptions = []

      const findOptions = (options, { key, categoryText, multiple }) => {
        if (Array.isArray(options)) {
          options.forEach(option => {
            if (has(option, 'submenu')) {
              const submenuKey = this.getSubMenuKeyForOption(option)
              let category = ''
              if (categoryText) {
                category = categoryText + ' / ' + option.text
              } else {
                category = option.text
              }
              const multipleMenu = get(option, 'submenu.multiple', false)
              findOptions(option.submenu.options, { key: submenuKey, categoryText: category, multiple: multipleMenu })
            } else {
              finalOptions.push({ text: option.text, value: option.value, key, categoryText, multiple })
            }
          })
        }
      }
      findOptions(this.options, { multiple: this.multiple })
      return finalOptions
    }

  },

  watch: {
    value: function (val) {
      this.selectedValues = val
    },

    selectedValues: function (values, oldvalues) {
      // check if we are a submenu.
      // if (!this.isSubmenu) {
      this.$emit('input', values)
      this.$emit('change', values)

      this.eventSelectedItens()
    },

    myValues: function (values) {
      if (this.isSubmenu) {
        this.selectedValues = values
      }
    },

    planarOptions: function (vals) {
      this.fuse = this.createFuze()
    }

  },

  beforeCreate () {
    this.$get = get
  },

  created: function () {
    this.fuse = this.createFuze()
  },

  mounted: function () {
    this.eventSelectedItens()
    this.$nextTick(() => {
      if (this.$refs['input-search']) {
        this.$refs['input-search'].focus()
      }
    })
  },

  methods: {

    eventSelectedItens: function () {
      // get selected itens
      const items = this.getSelectedItems()
      /** @event with selected Itens, not only is value, thas is send in v-model */
      this.$emit('selectedItens', items)
    },

    createFuze: function () {
      return new Fuse(this.planarOptions, {
        threshold: 0.3,
        ignoreLocation: true,
        keys: [
          {
            name: 'text',
            weight: 0.8
          },
          {
            name: 'categoryText',
            weight: 0.5
          },
          {
            name: 'value',
            weight: 0.2
          }
        ]
      })
    },

    getSubMenuKeyForOption: function (option) {
      return get(option, 'submenu.key',
        get(option, 'key'),
        get(option, 'value'),
        get(option, 'text')
      )
    },

    /**
     * @public get selected items for the menu
     */

    getSelectedItems: function () {
      const items = []
      // SE COMO OBJETOS
      if (this.selectedValues?.constructor === Object) {
        Object.keys(this.selectedValues).forEach(key => {
          let values = this.selectedValues[key]
          values = Array.isArray(values) ? values : [values]
          values.forEach(value => {
            const item = this.planarOptions.find(option => {
              return (option.value == value && option.key == key)
            })
            items.push(item)
          })
        })
      // SE COMO ARRAY OU VALUE< PEGO DO MEU OPTIONS MESMO
      } else {
        const values = Array.isArray(this.selectedValues) ? this.selectedValues : [this.selectedValues]
        values.forEach(value => {
          const item = this.myOptions.find(option => {
            return (option.value == value)
          })
          items.push(item)
        })
      }
      return items
    },

    getValuesForSubmenu: function (subvalueKey) {

    },

    getActiveforOption: function (option) {
      let values
      const root = this.rootMenu
      // can be from menu or form planar/search option
      const key = this.keyName || option.key
      if (key) {
        values = get(root.selectedValues, key)
      } else {
        values = this.selectedValues
      }
      return Array.isArray(values) ? values.includes(option.value) : values == option.value
    },

    getTotalActiveforSubMenuOption: function (option) {
      // if dont have submenu, dont show chips
      const submenuOptions = get(option, 'submenu.options')
      if (Array.isArray(submenuOptions) && submenuOptions.length === 0) {
        return ''
      }
      // if have submenu,
      const submenuKey = this.getSubMenuKeyForOption(option)
      // get current values for submenu
      const root = this.rootMenu
      let values = get(root.selectedValues, submenuKey)
      if (!values) {
        return ''
      }
      if (!Array.isArray(values)) {
        values = [values]
      }
      // loop in current values to see if we have options with if
      let count = 0
      values.forEach(value => {
        const filtered = submenuOptions.filter(submenuoption => submenuoption.value === value)
        count += filtered.length
      })
      return count
    },

    /**
     * Save in the root dropdown the submenu options
    */
    commitSubMenu: function (key, values, mode = 'add') {
      let rootValues
      if (this.rootMenu.selectedValues.constructor !== Object) {
        rootValues = {}
      } else {
        rootValues = { ...this.rootMenu.selectedValues }
      }

      if (this.rootMenu.multiple === false || mode == 'set') {
        rootValues = {}
      }
      rootValues[key] = values
      this.rootMenu.selectedValues = { ...rootValues }
    },

    addItem: function ({ value, key, multiple }) {
      if (key) {
        let values = get(this.rootMenu.selectedValues, key, [])
        values = Array.isArray(values) ? [...values] : [values]
        values.push(value)
        this.commitSubMenu(key, values, 'add')
      } else {
        if (multiple) {
          this.selectedValues.push(value)
        } else {
          this.selectedValues = values
        }
      }
    },

    removeItem: function ({ value, key, multiple }) {
      let values
      if (key) {
        values = get(this.rootMenu.selectedValues, key, [])
      } else {
        values = this.selectedValues
      }

      // remove the item
      const selectedValues = Array.isArray(values) ? values : [values]
      const valuesStringfy = selectedValues.map(item => JSON.stringify(item))
      const valueStringfy = JSON.stringify(value)
      if (valuesStringfy.includes(valueStringfy)) {
        const index = valuesStringfy.indexOf(valueStringfy)
        selectedValues.splice(index, 1)
      }

      if (key) {
        this.commitSubMenu(key, selectedValues)
      } else {
        this.selectedValues = selectedValues
      }
    },

    setItem: function ({ value, key, multiple }) {
      let values
      if (multiple) {
        values = [value]
      } else {
        values = value
      }

      if (key) {
        this.commitSubMenu(key, values, 'set')
      } else {
        this.selectedValues = values
      }
    }
  }
}

</script>

<style lang="stylus">

    .dropdown-menu{
      // position:relative
      overflow auto
      width: 100%
    }

    .search-bar{
      width:100%;
      display:flex;
      position:relative;
      min-height: 2.5em;
      margin-bottom:1px;
      overflow:hidden;
      align-items:center;
      background-color: var(--dropdown-search-bar__background,#000000cc);

     .search-bar__input{
        position:absolute;
        background:none;
        outline:none;
        top:0;
        bottom:0;
        left:0;
        right:0;
        width: calc( 100% - 80px);
        margin: 0;
        border: none;
        padding: 0.3em 28px 0.3em 45px
        font-size: 14px;
        color: var(--dropdown-search-bar__color, white);

      }

      .search-bar__icon{
              color: var(--dropdown-menu-item__color, white)
              position:absolute;
              left:10px;
              pointer:none;
              user-select:none;
              z-index:5
      }
      .search-bar__clear{
          position:absolute;
          right:10px;
          cursor:pointer;
           z-index:5
      }

    }

</style>

<docs>

```vue
<template>
  <div>

    <h5> //TODO - criar documentacao completa </h5>

    <div style="width:350px;">
      <dropdown-menu
      search-bar
        v-model="regioesSelected"
        label="Regiões"
        :options="regioes"
        :multiple="false">
      </dropdown-menu>

      <pre>
    {{regioesSelected}}
    </pre>

    </div>

    <div style="width:350px;">
      <dropdown-menu search-bar v-model="filtrosSelected" label="Filtros" :options="filtros" :multiple="true">
      </dropdown-menu>

      <pre>
    {{filtrosSelected}}
    </pre>

    </div>

    <div style="width:350px;">
      <dropdown-menu v-model="anoSelected" label="Anos" :options="anos" :multiple="false">
      </dropdown-menu>

    <button @click="anoSelected--"> mudaanod </button>
      <pre>
    {{anoSelected}}
    </pre>

    </div>

    <div style="width:350px;">
      <dropdown-menu v-model="anoSelectedMultiple" label="Anos" :options="anos" :multiple="true">
      </dropdown-menu>

      <pre>
    {{anoSelectedMultiple}}
    </pre>

    </div>

  </div>
</template>

<script>

export default {
  data () {
    return {
      filtrosSelected: [],
      regioesSelected: {
  "geocod-estados": [
    51
  ],
  "municipios": "campinas"
},
      anoSelected: 2018,
      anoSelectedMultiple: [2015,2018],

      consorsios: null,

      anos: [2015, 2016, 2017, 2018],

      regioes: [
        {
          text: 'Estados',
          value: null,
          submenu: {
            key: 'geocod-estados',
            multiple: true,
            search: true,
            options: [
              {
                text: 'Rio de Janeiro',
                value: 13,
                submenu: {
                  key: 'municipios',
                  multiple: true,
                  options: [{ text: 'Nova Friburgo', value: 'novafriburgo' }, { text: 'Rezende', value: 'rezende' }]
                }
              },
              {
                text: 'Brasília',
                value: 51
              },
              {
                text: 'Minas Gerais',
                value: 433
              },
              {
                text: 'São Paulo',
                value: 40,
                submenu: {
                  key: 'municipios',
                  multiple: false,
                  options: [{ text: 'Campinas', value: 'campinas' }, { text: 'Santo Andre', value: 'santoandre' }]
                }
              }
            ]
          }
        },

        {
          text: 'Região Metropolitana',
          value: null,
          submenu: {
            key: 'geocod-regiao-metropolitana',
            multiple: true,
            options: [
              {
                text: 'Grande São Paulo',
                value: 13
              },
              {
                text: 'Regiao Metropolitana 2',
                value: 51
              },
              {
                text: 'Regiao Metropolitana 4',
                value: 40
              }
            ]
          }
        },
        { text: 'Brasil', value: 0 }
      ],

      filtros: [
        {
          text: 'Servicos Prestados',
          value: null,
          submenu: {
            key: 'servicos-prestados',
            multiple: true,
            options: [
              {
                text: 'Lavagem de carro',
                value: 13
              },
              {
                text: 'Aviacão',
                value: 51
              },
              {
                text: 'São Paulo',
                value: 40
              }
            ]
          }
        },

        {
          text: 'Consorcios',
          value: null,
          submenu: {
            key: 'consorcios',
            'v-model': 'consorcios',
            multiple: true,
            options: [
              {
                text: 'consorcio1',
                value: 13
              },
              {
                text: 'Consorcio 2',
                value: 51
              },
              {
                text: 'consorcio3',
                value: 40
              }
            ]
          }
        },
        { text: 'Brasil', value: 0 }
      ]
    }
  },
  methods: {
    callMethod: function (e) {
      this.event = e.point
    },
    changeColor () {
      var letters = '0123456789ABCDEF'
      var color = '#'
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      this.color = color
    }
  }
}
</script>
```

</docs>
