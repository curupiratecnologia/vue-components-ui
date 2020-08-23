<template>
    <div>
        <slot :result="result"></slot>
    </div>
</template>

<script>

export default {
  name: 'get-data',
  inject: ['module', 'urlPrefix'],
  props: {
    /**
     * if set a key name, will return the data for that key, or array of keys
     */
    keys: {
      type: [String, Number, Array]
    },
    /**
     * if set, return the filters in a result.filters, and result.setFilter to define the filter to a new value
     */
    getFilters: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    result: function () {
      //
      // return  this.$store.state?.[this.module]?.data
      const result = { data: {}, items: {}, loading: false, filters: {} }
      const data = { ...(this.$store.state?.[this.module]?.data ?? {}) }
      const keys = this.keys
      if (keys) {
        const keysFinal = Array.isArray(keys) ? [...keys] : [keys]
        keysFinal.forEach(key => {
          if (data[key]) {
            result.data[key] = data[key]
            result.items[key] = data[key].items
            if (data[key].loading) {
              result.loading = true
            }
          }
        })
      }

      if (!Array.isArray(this.keys)) {
        result.items = result.data?.[this.keys]?.items
      }
      result.filters = this.$store.state?.[this.module]?.filters
      return result
    }

  },

  methods: {

  }

}

</script>
