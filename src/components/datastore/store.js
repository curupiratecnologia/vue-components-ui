// @flow

import keyBy from 'lodash/keyBy'
import get from 'lodash/get'
import { getServer } from './api.js'
import Vue from 'vue'

// DEFINE TYPES
type DATAITEMS = {
  key: string,
  items?: Array<mixed>,
  itemsByKey?: { [string|number]: mixed },
  loading: boolean,
  error?: boolean,
  errorMsg?: string,
  noData?: boolean
};

type ENDPOINT = {
  keyName: string,
  itemKeyName?: string | void,
  itemsPath?: string | void,
  query: string,
  type: "api" | "graphql",
  variables?: {} | void,
  needFilters?: Array | void,
  defaultValue?: any,
  variablesTransform?: mixed,
  resultTransform?: mixed,
};

// DEFINE STATE OBJECT
const STATE:{
  pathPrefix:string,
  data: { [string]: DATAITEMS },
  endpoints: { [string]: ENDPOINT },
  filters:{[string]:any},
  ...
} = {
  pathPrefix: '',
  data: {},
  endpoints: {},
  filters: {}
}

type actionType = {
  state: typeof STATE,
  dispatch: any,
  commit: any,
  getters: any,
  rootGetters:any,
}

export default {

  namespaced: true,

  state () {
    return { ...STATE }
  },

  mutations: {

    addEndpoint: function (state:typeof STATE, endpoint:ENDPOINT) {
      // ADD ENDPOINT
      const key = endpoint?.keyName ?? endpoint.query
      const obj = {}
      obj[key] = { ...endpoint }

      state.endpoints = { ...state.endpoints, ...obj }

      // ADD DUMP DATA ITEM, OR MANTAIN A EXISTING ITEM
      const objdata = {}
      if (state.data[key]) {
        objdata[key] = { ...state.data[key] }
      } else {
        objdata[key] = {
          key: key,
          items: endpoint.defaultValue ?? [],
          loading: true,
          loaded: false,
          error: false,
          errorMsg: 'none',
          noData: true,
          ready: false // when finish loaded and have data and no errors
        }
        state.data = { ...state.data, ...objdata }
        // state.data[key] = objdata
        // state.data[obj.key] = { ...state.data[obj.key], ...obj }
      }
    },

    removeEndpoint: function (state:typeof STATE, endpointKey:string) {
      const endpoints = { ...state.endpoints }
      delete endpoints?.[endpointKey]
      state.endpoints = { ...endpoints }
    },

    setDataStatus: function (state:typeof STATE, obj:DATAITEMS) {
      const objdata = {}
      objdata[obj.key] = obj
      state.data = { ...state.data, ...objdata }
      // state.data[obj.key] = { ...state.data[obj.key], ...obj }
    },

    setFilter: function (state:typeof STATE, filter:{[string]:any}) {
      let stateFilters = { ...state.filters }
      stateFilters = { ...stateFilters, ...filter }
      state.filters = { ...stateFilters }
    }

  },

  actions: {

    addFilters: function () {

    },

    async addDataSource (ctx:actionType, endpoint: ENDPOINT) {
      ctx.commit('addEndpoint', endpoint)
      ctx.dispatch('loadData', endpoint)
    },

    async updateDataSource (ctx:actionType, endpoints:{ new: ENDPOINT, old: ENDPOINT }) {
      if (endpoints.new.keyName !== endpoints?.old?.keyName) {
        ctx.commit('removeEndpoint', endpoints.old.keyName)
      }
      ctx.commit('addEndpoint', endpoints.new)
      ctx.dispatch('loadData', endpoints.new)
    },

    async loadData (ctx: actionType, endpoint: ENDPOINT) {
      // set the default Objetc
      const obj:DATAITEMS = {
        key: endpoint.keyName,
        items: endpoint.defaultValue ?? [],
        loading: false,
        loaded: false,
        error: false,
        errormsg: '',
        noData: false,
        ready: false
      }

      // only request if we have all conditions, like  needFilters we need we have ser
      let canRequest = true
      if (Array.isArray(endpoint?.needFilters) && endpoint.needFilters.length > 1) {
        endpoint.needFilters.forEach((key) => {
          const val = endpoint?.variables?.[key]
          if (val === undefined || val === null) {
            canRequest = false
            obj.noData = true
          }
        })
      }

      if (canRequest === false) {
        return obj
      }

      ctx.commit('setDataStatus', { key: endpoint.keyName, loading: true, loaded: false, noData: false, ready: false })

      let response

      try {
        response = await getServer(endpoint.query, endpoint.variables)

        if (response.data && response.status === 200) {
          let data = response.data
          if (endpoint.itemsPath) {
            data = get(data, endpoint.itemsPath, null)
          }
          obj.items = data
          obj.ready = true

          if (endpoint.itemKeyName) {
            obj.itemsByKey = keyBy(data, endpoint.itemKeyName)
          }
        } else {
          obj.noData = true
          obj.items = endpoint.defaultValue ?? []
        }
        obj.loaded = true
      } catch (e) {
        obj.loaded = true
        obj.error = true
        obj.noData = true
        obj.ready = false
        obj.errormsg = JSON.stringify(e.config.url + e.message)
        obj.items = endpoint.defaultValue ?? []

        // TODO - put notify system in another place
        // if (Vue.notify) {
        //   Vue.notify({
        //     group: 'data',
        //     type: 'error',
        //     title: 'Erro de requisição ao servidor',
        //     duration: 100000,
        //     text: obj.errormsg
        //   })
        // }
      }
      ctx.commit('setDataStatus', obj)
      return obj
    },

    async getServer (ctx, { query, params }) {
      let response
      const obj:DATAITEMS = {
        key: query,
        items: [],
        loading: false,
        error: false,
        errormsg: '',
        noData: false
      }
      try {
        response = await getServer(query, params)

        if (response.data && response.status === 200) {
          obj.items = response.data
        } else {
          obj.noData = true
        }
      } catch (e) {
        obj.error = true
        obj.noData = true
        obj.errormsg = JSON.stringify(e)
      }

      return obj
    }

  },

  getters: {

    getData: (state:mixed) => (key) => {
      return state.data[key] ?? { items: [], loading: true, noData: true }
    },
    getFilter: (state:mixed) => (key) => {
      if (key) {
        return state.filters?.[key]
      } else {
        return state.filters
      }
    },
    getFilters: (state) => state.filters

  }
}
