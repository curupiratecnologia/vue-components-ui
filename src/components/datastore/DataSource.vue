<template>
    <div v-if="$scopedSlots.default" :class="{loading:result.loading}">
        <slot :result="result" 
              :getState="getState" 
              :setState="setState"
              :getFilters="getFilters"
              :setFilters="setFilters"
         ></slot>
    </div>
</template>

<script>

export default {
  name: 'data-source',

  inject: ['module', 'urlPrefix', 'filtersToUrlGlobal', 'getState', 'setState', 'getFilters', 'setFilters'],

  props: {
    /**
     * key set for this data items
     */
    keyName: {
      type: [String, Number]
    },
    /**
     * the path to get the items
     */
    itemsPath: {
      type: [String, Number]
    },
    /**
     * what is the id of returned itens
     * Use when itens are returned as array<objects>,
     * and want to create objects for it
     */
    itemKeyName: {
      type: [String, Number]
    },
    /**
     * Url ou GraphQL query string.
     * url start without / will use as prefix the StoreData urlPrefix
     * if start with /, ou a complrete // or http:// will ignore dataSource prefix
     */
    query: {
      type: String
    },
    /**
     * Objects to watch. When change will recall, passing it as parameters
     */
    variables: {
      type: Object,
      default: () => ({})
    },
    /**
     * only request is we have set as not null this filters/variables info
     */
    needFilters: {
      type: Array
    },
    /**
     * the default value to set the item
     */
    defaultValue: {
      type: [Object, Array, String, Number]
    },
    /**
     * How to transform variable Fiter
     */
    variablesTransform: {
      type: Function
    },
    /**
     * How to transform variable Fiter
     */
    resultTransform: {
      type: Function
    },
    /**
     * type of request
     * @values api, graphql
     */
    type: {
      type: String,
      default: 'api'
    },
    /**
     * Define filters to listem, or the keys with we will listem from the filters.
     * internaly change the variables. endpoint just watch variables\
     * @values all, *, false, Array of filterkeys..
     */
    watchFilters: {
      type: [String, Array, Boolean],
      default: 'all'
    },
    /**
     *Define filters to ignore
     * internaly change the variables. endpoint just watch variables\
     * @values all, *, false, Array of filterkeys..
     */
    ignoreFilters: {
      type: [String, Array, Boolean],
      default: false
    },

    showLoader: {
      type: Boolean,
      default: false
    },
    // /**
    //  * @model - vmodel it is utilized just to bind the result with a parent property ;)
    //  */
    // value: {
    //   type: Object,
    // }

    /**
     * how the filter/variables keys is called in url. Example, if you want pass a filter object as root params, without the filter key, you set it to {filterName:false},
     * or if want to change the name on call, set  {filterName:nameInUrl}
     */
    filtersToUrlKey: {
      type: Object
    }

  },

  data () {
    return {
      endpoint: undefined
    }
  },

  created: function () {
    this.createEndpoint()
  },

  watch: {
    'result': function (val, oldval) {
      if (JSON.stringify(val) !== JSON.stringify(oldval)) {
        this.$emit('input', val)
        this.$emit('change', val)
      }
    },

    '$props.variables': {
      deep: true,
      handler (val, oldval) {
        if (JSON.stringify(val) !== JSON.stringify(oldval)) {
          this.createEndpoint()
        }
      }
    },
    'myWatchFilters': {
      deep: true,
      handler (val, oldval) {
        if (JSON.stringify(val) !== JSON.stringify(oldval)) {
          this.createEndpoint()
        }
      }
    },
    'endpoint': {
      deep: true,
      handler (val, oldval) {
        if (!oldval) {
          this.$store.dispatch(`${this.module}/addDataSource`, val)
        } else {
          this.$store.dispatch(`${this.module}/updateDataSource`, { new: val, old: oldval })
        }
      }
    }

  },

  computed: {

    result: function () {
      const data = this.$store.getters[this.module + '/getData'](this.keyName)
      return data
    },

    finalQuery: function () {
      let url = this.query
      if (this.urlPrefix && !url.match(/^(\/|http)/)) {
        url = this.urlPrefix + '/' + url
      }
      return url
    },

    /**
     * get the filters this dataSource Watch
     */
    myWatchFilters: function () {
      if (this.watchFilters === false) return
      const allFilters = this.$store.state?.[this.module]?.filters
      let filters = {}

      if (this.watchFilters === 'all' || this.watchFilters === '*') {
        filters = { ...allFilters }
      } else if (this.watchFilters) {
        const filtersKeys = Array.isArray(this.watchFilters) ? this.watchFilters : [this.watchFilters]
        filtersKeys.forEach(filterKey => {
          if (allFilters[filterKey] && allFilters[filterKey] !== null && allFilters[filterKey] !== undefined) {
            filters[filterKey] = allFilters[filterKey]
          }
        })
      }

      if (this.ignoreFilters !== false) {
        if (this.ignoreFilters === 'all' || this.ignoreFilters === '*') {
          return {}
        }
        const ignoreFiltersKeys = Array.isArray(this.ignoreFilters) ? this.ignoreFilters : [this.ignoreFilters]

        ignoreFiltersKeys.forEach(key => {
          if (filters[key]) delete filters[key]
        })
      }

      return filters
    },

    myVariables: function () {
      const variables = { ...this.variables, ...this.myWatchFilters }
      let finalVariables = {}

      // create final variables, incluind transformation from filtersToUrlGlobal and filtersToUrlKey
      Object.entries(variables).forEach((item) => {
        const key = item[0]
        const value = item[1]
        let hasfiltersToUrlKey = false
        let filterToUrlKey
        ['filtersToUrlGlobal', 'filtersToUrlKey'].forEach(lookup => {
          if (this[lookup] && Object.prototype.hasOwnProperty.call(this[lookup], key)) {
            hasfiltersToUrlKey = true
            filterToUrlKey = this[lookup][key]
          }
        })

        if (hasfiltersToUrlKey) {
          // false value means it is a object and we send it as root, merging it
          if (!filterToUrlKey && value?.constructor?.name === 'Object') {
            finalVariables = { ...finalVariables, ...value }
          // if truth, it is the new name of variable
          } else {
            finalVariables[key] = value
          }
        } else {
          finalVariables[key] = value
        }
      })

      return finalVariables
    }

  },

  methods: {

    createEndpoint: function () {
      const props = { ...this.$props }
      delete props.watchFilters
      props.variables = { ...this.myVariables }

      props.query = this.finalQuery
      this.endpoint = { ...props }
    },

    addEndpoint: function () {
      this.$store.dispatch(`${this.module}/addDataSource`, { ...this.endpoint })
    }

  }

}

</script>

<style  scoped>

.loading{
    opacity:1;
    mix-blend-mode: luminosity;
    color:black;
    transition: opacity 300ms, mix-blend-mode 300ms;
    animation: loadingAnimation 900ms infinite alternate;
}
.loading *{
        color:black;
    }

.loading .loading{
         opacity:initial;
         mix-blend-mode: initial;
         color:initial;
    }

@keyframes loadingAnimation {
  from {
    opacity: 0.2;
  }
  to {
    opacity: 0.1;

  }
}

</style>
