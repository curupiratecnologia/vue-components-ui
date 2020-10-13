const axios = require('axios')
import qs from 'qs'
var url = process.env.VUE_APP_GRAPHQL // process.env.VUE_APP_GRAPHQL || 'http://167.99.58.243:8080/v1/graphql'
var BASE_URL = process.env.VUE_APP_DATA_API // process.env.VUE_APP_GRAPHQL || 'http://167.99.58.243:8080/v1/graphql'

const graphQL = async function (query, variables = {}) {
  return new Promise((resolve, reject) => {
    axios({
      url: url,
      method: 'post',
      data: {
        query: query,
        variables
      }
    }).then(response => {
      resolve(response.data.data)
    }).catch((e) => {
      reject(e)
    })
  })
}

const axiosServer = axios.create({
  timeout: 30000
})

/**
 * Execute a query GET to the a server
 *
 * @param {*} query - Query can contain palcehodes wih {KEY}, tha will be replacede with value with thak key in variables
 * @param {*} [filters={}] - the parametres will pe passed
 * @returns
 */
const getServer = async function (query, filters = {}) {
  return new Promise((resolve, reject) => {
    let { url, variables } = parseURL(query, filters)
    url = mountURL(url)
    axios({
      url: url,
      method: 'get',
      params: variables
    }).then(response => {
      resolve(response)
    }).catch((e) => {
      reject(e)
    })
  })
}


/**
 * GET the url server
 *
 * @param {*} query - Query can contain palcehodes wih {KEY}, tha will be replacede with value with thak key in variables
 * @param {*} [filters={}] - the parametres will pe passed
 * @returns
 */
const getURL =  function (query, filters = {}) {
    let { url, variables } = parseURL(query, filters)
    url = mountURL(url)
    let varFinal = qs.stringify(variables, {arrayFormat: 'brackets'})
    return url+"?"+varFinal
}

/**
 * substitute in the url placeholdes with {KEY} with valu in variables
 *
 * @param {*} url
 * @param {*} [variables={}]
 * @returns
 */
const parseURL = function (url, variables = {}) {
  let urlFinal = url
  const variableFinal = { ...variables }
  Object.entries(variableFinal).forEach((item) => {
    const key = item[0]
    const value = item[1]
    const regex = new RegExp('\{' + key + '\}', 'gi')
    if (urlFinal.match(regex)) {
      urlFinal = urlFinal.replace(regex, value)
      delete variableFinal[key]
    }
  })
  return { url: urlFinal, variables: variableFinal }
}

/**
 * mout url with relative or absolute path, and remove any incosistence
 *
 * @param {*} url
 * @returns
 */
const mountURL = function (url) {
  // check if is relative or absolute url
  // if (url.match(/^(http|\/\/)/) === null) {
  //   url = BASE_URL + '/' + url
  // }
  // replace 2 dashs for one
  return url.replace(/\b(\/\/*)\b/g, '/')
}

export {
  axiosServer,
  getServer,
  graphQL,
  getURL
}
