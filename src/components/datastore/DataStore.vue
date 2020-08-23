<template>
    <div>
        <slot :result="{ state:$store.state[storeName] }"></slot>
    </div>
</template>

<script>

import painel from './store'

export default {
  name: 'StoreData',

  provide () {
    return {
      module: this.storeName,
      urlPrefix: this.urlPrefix,
      changeFilters: this.changeFilters,
      getters: this.getters,
      filters: this.currentFilters
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
     *  File Name in store/NAME will be merged with the store. Util to pute some personalize getters,acions etc
     */
    appendStore: {
      type: String,
      required: false
    },
    /**
     *  File Name in store/NAME will be merged with the store. Util to pute some personalize getters,acions etc
     */
    urlPrefix: {
      type: String,
      required: false
    },
    /**
     * What keys to watch and observer, i change, will reload all DataSource componentes in store.
     * Use with caution. Best is use dataSource variable objects
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
    this.$store.registerModule(this.storeName, painel)
    this.setFilters()
  },

  computed: {
    currentFilters: function () {
      const filters = this.$store.state?.[this.storeName]?.filters
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
     * will retur a getter or state of module
     */
    changeFilters: function (filter) {
      this.$store.commit(`${this.storeName}/setFilter`, filter)
    }

  }

}

</script>
