<template>

    <div :class="'dropdown dropdown--'+mode ">

          <popper
            :trigger="trigger"
            boundaries-selector="body"
            :append-to-body="true"
            :options="{
              strategy: 'fixed',
              placement: placement,
              modifiers: {
              flip: {
                enabled: false,
                },
                preventOverflow: {
                  escapeWithReference: true
                }
              }
            }">

            <div class='dropdown__trigger-wraper' slot="reference">
              <!-- trigger elements -->
              <slot name="trigger">
                  <div class="dropdown__trigger">

                      <div class="dropdown__trigger__label">
                        <slot name="label">{{label}}</slot>
                      </div>

                      <div class="dropdown__trigger__select">

                          <div class="dropdown__trigger__select-value">
                            <slot name="selecteitems" :items="selectedItens">
                              <div v-if="this.multiple === false && selectedItens.length == 1">
                                {{ $get(selectedItens,'[0].text') }}
                              </div>
                              <div v-else>
                                  <div
                                    v-for="item in selectedItens"
                                    :key="item.value+item.text"
                                    class="item_chips">
                                         <div class="item_chips__text">
                                           {{item.text}}
                                          </div>
                                          <div class="item_chips__close" @click.capture.stop="removeItem(item)" >
                                            <icon name="icon-close" scale="0.8"></icon>
                                          </div>
                                  </div>
                              </div>
                            </slot>
                          </div>

                          <div class="dropdown__trigger__select-icon">
                            <icon name="icon-triangle-down" scale="0.6" />
                          </div>
                      </div>

                  </div>
                </slot>
            </div>

            <!-- menu -->
            <keep-alive>
            <div class="popper submenu"  :style="{ width:menuWidth, 'max-width':menuWidth }">
            <dropdown-menu
                ref="dropdowmenu"
                :search-bar="search"
                v-model="selectedValues"
                @selectedItens="changeSelectedItens"
                :options="options"
                :maxWidth="parseInt(menuWidth)"
                :multiple="multiple" >
                <slot></slot>
            </dropdown-menu>
            </div>
            </keep-alive>

            </popper>
    </div>

</template>

<script>
import Popper from 'vue-popperjs'
import dropdownMenu from './dropdown-menu.vue'
import get from 'lodash/get'

export default {
  components: { Popper, dropdownMenu },
  props: {
    /**
    Label of menu
    */
    label: {
      type: String,
      default: ''
    },
    /**
   * with of the popup menu
   */
    menuWidth: {
      type: [String],
      default: '250px'
    },

    trigger:{
      type: String,
       default: 'clickToToggle',
       validator: function (value) {
        // O valor precisa corresponder a alguma dessas Strings
        return ['clickToToggle', 'hover','clickToToggle','focus'].indexOf(value) !== -1
      }

    },

    /**
    @model
    */
    value: {
      type: [Array, String, Boolean, Number, Object]
    },
    /**
    Search itens
    */
    search: {
      type: Boolean,
      default: true
    },
    /**
    display mode.
    @value menu or inline
    */
    mode: {
      type: String,
      default: 'menu',
      validator: function (value) {
        // O valor precisa corresponder a alguma dessas Strings
        return ['menu', 'inline'].indexOf(value) !== -1
      }
    },

    /**
    multiple selection
    */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     options, array with object with keys text value
    */
    options: {
      type: Array,
      default: () => ([{ text: 'lebel', value: 'value' }])
    },
    placement: {
      type: String,
      default: 'bottom-end'
    }

  },

  data () {
    return {
      selectedValues: this.value,
      selectedItens: []
    }
  },

  watch: {

    selectedValues: function (val) {
      this.$emit('input', val)
      this.$emit('change', val)
    },

    value: function () {
      this.selectedValues = this.value
    }

  },

  beforeCreate () {
    this.$get = get
  },

  methods: {
    changeSelectedItens: function (items) {
      this.selectedItens = items
      /**
       * @event changeItems
       * @description send selected itens, not only the values
       * @param {array} selectedItens
       */
      this.$emit('changeItems', this.selectedItens)
    },

    removeItem: function (item) {
      this.$refs.dropdowmenu.removeItem(item)
    }
  }

}
</script>

<style lang="stylus">

  .submenu{

      z-index:8110
   }

   .dropdown--menu{
      .dropdown__trigger-wraper{
            cursor:pointer;
            z-index 120;
            // width: 200px;
            // background: red
        }
        .dropdown__trigger__label{
            font-weight: bold;
            margin-bottom:0.5em;
            font-size: var(--dropdown-label__size, 14px)
        }

        .dropdown__trigger-wraper{
          margin-bottom: 0.5em;
        }

        .dropdown__trigger__select{
            cursor:pointer;
            position:relative;
            width 100%;
            border-bottom: 1px solid black
            min-height: var(--dropdown-select__size, 24px);
            display:flex;

            .dropdown__trigger__select-value{
              color: var(--dropdown-select__color, black)
              font-size: var(--dropdown-select__size, 24px)
              line-height: 0.75
              font-weight: bolder;
              padding: 0 0 0.2em 0
              flex-grow: 1
            }

            .dropdown__trigger__select-icon{
              width: 1em;
              align-items center

            }
        }
   }

   .dropdown--inline{
     .dropdown__trigger__select{
            cursor:pointer;
            position:relative;
            display:flex;
     }
      .dropdown__trigger__select-icon{
          font-size: 0.2em;
          align-items center
          opacity 0.5
          padding-left:0.2em
      }
   }



    .item_chips{
       display:inline-flex;
       align-items center
       padding:5px 5px 5px 10px;
       margin-right: 3px;
       font-size: var(--dropdown-select-chips__size, 11px)
       color: var(--dropdown-select-chips__color, black)
       background: var(--dropdown-select-chips__background,#A4BB84)
       border-radius: 12px;

       .item_chips__text{
         margin-right 5px
         font-weight: normal
        }
        .item_chips__close{
          opacity: 0.6
          transform: scale(0.7)
          transition all 100ms 50ms
          &:hover{
              opacity: 0.9
          transform: scale(1)

          }
        }

     }

</style>
