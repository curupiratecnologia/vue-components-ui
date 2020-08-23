<template>
    <div>
        <slot :result="result"></slot>
    </div>
</template>

<script>

export default {
  name: 'data-source',

  inject: ['module', 'urlPrefix'],

  props: {
    /**
     * if set a key name, will return the data for that key, or array of keys
     */
    keys: {
      type: [String, Number, Array]
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
      type: Object
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
     * Object defining filter thas will be saved in state filter
     */
    filters: {
      type: Object

    }

  },

  data () {
    return {
      data: {}
    }
  },

  created: function () {
    // this.addEndpoint()
  },

  watch: {
  },

  computed: {
    result: function () {
      return this.$store.state?.[this.module]?.data?.[this.keyName] ?? { items: [], loading: true }
    },
    finalQuery: function () {
      let url = this.query
      if (this.urlPrefix && !url.match(/^(\/|http)/)) {
        url = this.urlPrefix + '/' + url
      }
      return url
    }
  },

  methods: {
    addEndpoint: function () {
      // this.$store.dispatch(`${this.module}/addDataSource`, { ...this.$props, query: this.finalQuery })
    },

    setFilter: function (filter) {

    }
  }

}

</script>
