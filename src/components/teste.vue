<template>
    <div style="width:100px;">

        <data-source v-model="regions"
                    :variables="{ tipo_regiao: regionsToQuery }"
                    keyName="regions"
                    :query="queryPath"
                    :watchFilters="false" >

        </data-source>

        <dropdown v-if="dropdownRegionsOptions" placement="right-start" v-model="regiaoselecionada" label="Região"
            :options="dropdownRegionsOptions" :multiple="true">

            <template #trigger>
                <svg width="100" height="35" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 5.88604C0 3.08967 2.26691 0.822754 5.06329 0.822754H94.9367C97.7331 0.822754 100 3.08967 100 5.88605V29.9367C100 32.7331 97.7331 35 94.9367 35H5.0633C2.26692 35 0 32.7331 0 29.9367V5.88604Z"
                        fill="#E8F595" />
                    <text opacity="0.8" fill="black" xml:space="preserve" style="white-space: pre"
                        font-family="Proxima Nova Alt" font-size="11.3924" font-weight="bold" letter-spacing="0em">
                        <tspan x="41.7721" y="15.9481">Recorte&#x2028;</tspan>
                        <tspan x="41.7721" y="25.9481">Regional</tspan>
                    </text>
                    <path d="M20.2532 8.41748H29.114V26.139H11.3925V16.5966" stroke="black" stroke-width="1.26582"
                        stroke-dasharray="1.27 1.27" />

                    <circle v-if="regiaoselecionada" cx="14.5569" cy="12.848" r="8.22785" fill="#FF522C" />
                    <text v-if="regiaoselecionada" fill="white" xml:space="preserve" style="white-space: pre"
                    text-anchor="middle"
                        font-family="Proxima Nova Alt" font-size="11.3924" font-weight="bold" letter-spacing="0em">
                        <tspan x="14.0914" y="15.7582">{{totalRegiao}}</tspan>
                    </text>

                </svg>

            </template>
        </dropdown>

          <data-source
                    keyName="unidadetratamento"
                    query="unidade_tratamento/2018"
                    watchFilters="regiao"
                >
                <template #default="{result}">
                  <div>
                      <pre>{{result}}</pre>
                  </div>
                </template>

        </data-source>
    </div>
</template>

<script>

export default {
  name: 'FilterRegions',

  inject: ['changeFilters', 'getFilters'],
  props: {
    queryPath: {
      default: '/painel/geral/filtro_regiao'
    },
    regionsToQuery: {
      default: () => (['estado', 'bioma', 'bacia_hidrografica', 'macroregiao', 'regiao_metropolitana'])
    }
  },
  data () {
    return {
      ano_referencia: 2018,
      regions: {},
      reionsKeys: ['estado', 'bioma', 'bacia_hidrografica', 'macroregiao', 'regiao_metropolitana']
    }
  },
  computed: {

    regiaoselecionada: {
      get: function () {
        return this.getFilters('regiao') || 0
      },
      set: function (val, oldval) {
        if (JSON.stringify(val) === JSON.stringify(oldval)) {
          return
        }
        this.changeFilters({ regiao: val })
      }
    },

    totalRegiao: function () {
      if (this.regiaoselecionada === 0) return 0
      let total = 0
      Object.values(this.regiaoselecionada).forEach(value => {
        total += Array.isArray(value) ? value.length : 1
      })
      return total
    },

    dropdownRegionsOptions: function () {
      const region = this.regions
      if (region?.loaded === false) return false

      const options = [{ text: 'Brasil', value: 0 }]
      if (!Array.isArray(region.items)) {
        return options
      }
      region.items.forEach(region => {
        const option = {}
        option.text = region.regiao
        if (Array.isArray(region.itens)) {
          option.submenu = { multiple: true }
          option.submenu.key = region.filter_name
          option.submenu.options = region.itens.map(item => ({ text: item.nome, value: item.geocodigo }))
        }
        options.push(option)
      })
      return options
    }
  }
}

</script>
