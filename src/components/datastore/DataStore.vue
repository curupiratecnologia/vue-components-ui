<template>
    <div>
        <slot :result="{ state:$store.state[storeName] }"></slot>
    </div>
</template>

<script>

import store from './store'

export default {
  name: 'StoreData',

  provide () {
    return {
      module: this.storeName,
      urlPrefix: this.urlPrefix,
      changeFilters: this.changeFilters,
      getters: this.getters,
      filters: this.currentFilters, // remove because it is not observable
      getFilters: this.getFilters,
      getFilter: this.getFilters,
      filtersToUrlGlobal: this.filtersToUrlKey
    }
  },

  props: {
    /**
     * Name of the module/namespace we will put on store.
     */
    storeName: {
      type: String,
      required: true
    },
    /**
     *  store object to append to
     */
    appendStore: {
      type: Object,
      required: false
    },
    /**
     *  the prefix of all call make by inners <datasources>. If dataSource start with // or http, it will be ignored.
     */
    urlPrefix: {
      type: String,
      required: false
    },
    /**
     * What keys to watch and observer, i change, will reload all DataSource componentes in store.
     * Use with caution. Best is use dataSource variable objects
     * TODO
     */
    observersStateKeys: {
      type: [Array],
      default: () => (['year', 'region'])
    },
    /**
     * Object defining filter thas will be saved in state filter
     */
    filters: {
      type: Object
    },
    /**
     * how the filter keys is called in url. Example, if you want pass a filter object as root params, without the filter key, you set it to {filterName:null},
     * or if want to change the name on call, set  {filterName:nameInUrl}
     */
    filtersToUrlKey: {
      type: Object
    }
  },

  data () {
    return {
      items: {},
      filtros: {},
      regiaoFiltros: {},
      ano: 2018
    }
  },

  created () {
    // Register the new storeModule for panel
    const storeFinal = store
    storeFinal.state = storeFinal.state()
    debugger;
    if (this.appendStore) {
      ['state', 'getters', 'actions', 'mutations'].forEach(storeProp => {
        if (this.appendStore[storeProp]) {
          Object.entries(this.appendStore[storeProp]).forEach((item) => {
            const key = item[0]
            const value = item[1]
            if (storeFinal[storeProp][key]) {
              throw new Error('Item ' + key + ' already exists ' + storeProp + ' in DataSource Store, use another name')
            } else {
              storeFinal[storeProp][key] = value
            }
          })
        }
      })
    }

    this.$store.registerModule(this.storeName, storeFinal)
    this.setFilters()
  },

  computed: {
    currentFilters: function () {
      const filters = this.$store.getters[`${this.storeName}/getFilters`]
      if (!filters) {
        return this.filters
      }
      return filters
    }
  },

  methods: {
    /**
     * @public
     * will retur a getter or state of module
     */
    getters: function (key, obj = {}) {
      // try to get from a getter
      const getter = this.$store.getters[`${this.storeName}/${key}`]
      if (getter) {
        return getter
      } else {
        const state = this.$store.state[this.storeName]
        return state[key] ?? state.data[key]
      }
    },

    setFilters: function () {
      this.$store.commit(`${this.storeName}/setFilter`, this.filters)
    },

    /**
     * @public
     * will change a filter to a defined value
     */
    changeFilters: function (filter) {
      this.$store.commit(`${this.storeName}/setFilter`, filter)
    },

    /**
     * @public
     * will return a filter value, or all filter if no arg passed
     */
    getFilters: function (filter) {
      return this.$store.getters[`${this.storeName}/getFilter`](filter)
    }

  }

}

</script>
