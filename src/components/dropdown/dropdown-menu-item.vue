<template>

    <div class='dropdown-menu-item-wrapper' ref='menu'>

      <!--  TODO - URGENT  refazer parte de popper, esta demorando demais -->
      <div v-if="!hasSubmenu">
            <div slot="reference"
          ref='dropdown-menu-item'
          :name='"dropdown-menu-item"+value'
          :class="{
            'dropdown-menu-item': !$scopedSlots['menuItem'],
            disable:disabled,
            active:active
            }"
            @click="myClickNormal"
          >

          <!-- @slot Use this slot to define all the menu item template.
                  @binding {object} props all props of componente, include text, value, active and all props
            -->
            <slot name="menuItem" :props="this.$props" >

              <div v-if="multiple && !hasSubmenu" class="dropdown-menu-item__icon"  >
                <div v-if="!active" @click.capture.stop="myClickAdd" ><icon  scale="1" name='icon-plus'   /></div>
                <div v-if="active"  @click.capture.stop="myClickRemove" > <icon  scale="1" name='icon-minus' /></div>
              </div>

              <div class="dropdown-menu-item__text">

                <!-- @slot menu item text -->
                <slot v-if="!$scopedSlots['menuItemText']">
                  <div class="dropdown-menu-item__text">
                    <div v-if="categoryText" class='dropdown-menu-item__text__category'>{{ categoryText }}</div>
                    <div class='dropdown-menu-item__text__content'>{{ text }}</div>
                  </div>
                </slot>

                <!-- @slot Use this slot to define the text template
                        @binding {object} props all props of componente, include text, value, active and all props
                -->
                <slot name="menuItemText" :props="this.$props" >
                </slot>
              </div>

              <div v-if="chipsText" class="dropdown-menu-item__chips">
                {{chipsText}}
              </div>

              <div v-if="hasSubmenu" class="dropdown-menu-item__carret">
                <icon name="icon-triangle-right" scale="0.55" />
              </div>

            </slot>
        </div>
      </div>

      <popper v-else
        trigger="hover"
        boundaries-selector="body"
        :options="{
        placement: 'right-start',
        strategy: 'fixed',
        modifiers: {
          flip: {
    enabled: false,
     fallbackPlacements: ['left-start'],
  },
  preventOverflow: {
    escapeWithReference: true
  }
            }
        }">

        <div slot="reference"
          ref='dropdown-menu-item'
          :name='"dropdown-menu-item"+value'
          :class="{
            'dropdown-menu-item': !$scopedSlots['menuItem'],
            disable:disabled,
            active:active
            }"
            @click="myClickNormal"
          >

          <!-- @slot Use this slot to define all the menu item template.
                  @binding {object} props all props of componente, include text, value, active and all props
            -->
            <slot name="menuItem" :props="this.$props" >

              <div v-if="multiple && !hasSubmenu" class="dropdown-menu-item__icon"  >
                <div v-if="!active" @click.capture.stop="myClickAdd" ><icon  scale="1" name='icon-plus'   /></div>
                <div v-if="active"  @click.capture.stop="myClickRemove" > <icon  scale="1" name='icon-minus' /></div>
              </div>

              <div class="dropdown-menu-item__text">

                <!-- @slot menu item text -->
                <slot v-if="!$scopedSlots['menuItemText']">
                  <div class="dropdown-menu-item__text">
                    <div v-if="categoryText" class='dropdown-menu-item__text__category'>{{ categoryText }}</div>
                    <div class='dropdown-menu-item__text__content'>{{ text }}</div>
                  </div>
                </slot>

                <!-- @slot Use this slot to define the text template
                        @binding {object} props all props of componente, include text, value, active and all props
                -->
                <slot name="menuItemText" :props="this.$props" >
                </slot>
              </div>

              <div v-if="chipsText" class="dropdown-menu-item__chips">
                {{chipsText}}
              </div>

              <div v-if="hasSubmenu" class="dropdown-menu-item__carret">
                <icon name="icon-triangle-right" scale="0.55" />
              </div>

            </slot>
        </div>

        <div  keep-alive
                style="overflow:auto;"
                  class='popper sub-menu'>
                  <dropdown-menu keep-alive
                        max-width="100%"
                        maxHeight="400px"
                        :multiple="submenu.multiple"
                        :options="submenu.options"
                        :search-bar="submenu.search || submenu.searchBar "
                        :keyName="keyName"
                        />

          </div>
          <!-- TODO - bem deselegante so para evitar erro, mudar tudo para render function -->

      </popper>

    </div>
</template>

<script>
import Popper from 'vue-popperjs'
// import 'vue-popperjs/dist/vue-popper.css';
export default {
  name: 'dropdown-menu-item',
  components: { Popper, dropdownMenu: () => import('./dropdown-menu.vue') },

  props: {
    /**
    Text to show in menu item
    */
    text: {
    },
    /**
    Value of item, like the option value
    */
    value: {
      type: [String, Number, Array, Object]
    },
    /**
    Small text to show above text
    */
    categoryText: {
      type: String
    },
    /**
    Text/number to show in the end of menu-item
    */
    chipsText: {
      type: [String, Number]
    },
    /**
    if is disabled
    */
    disabled: {
      type: Boolean,
      defalt: false
    },
    /**
      if show checkbox for multiple selections
    */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
    if menu-item is active
    */
    active: {
      type: Boolean,
      default: false
    },
    /**
    KeyName for the value
    */
    keyName: {
      type: [String, Number],
      default: undefined
    },
    /**
    // if click parent menu, will select all submenu
    */
    selectAllSubmenuOnClick: {
      type: Boolean,
      default: false
    },
    /**
    * Define if have a SubMenu
    * @values {options:[{text,value}], multiple}
    */
    submenu: {
      type: [Object, Boolean],
      default: () => ({ key: '', options: [], multiple: false })
    }
  },

  data () {
    return {
      submenuOpen: true,
      selected: undefined
    }
  },

  computed: {

    hasSubmenu: function () {
      if (this.submenu && Array.isArray(this.submenu.options)) {
        return (this.submenu.options.length > 0)
      }
      return false
    }

  },

  methods: {

    myClickNormal: function () {
      if (this.hasSubmenu) return
      if (this.active) {
        this.$emit('clickRemove', { value: this.value, key: this.keyName, multiple: this.multiple })
      } else {
        this.$emit('click', { value: this.value, key: this.keyName, multiple: this.multiple })
      }
    },

    myClickAdd: function () {
      if (this.hasSubmenu) return
      this.$emit('clickAdd', { value: this.value, key: this.keyName, multiple: this.multiple })
    },

    myClickRemove: function () {
      if (this.hasSubmenu) return
      this.$emit('clickRemove', { value: this.value, key: this.keyName, multiple: this.multiple })
    }
  }

}

</script>

<style lang="stylus" scoped>

  .dropdown-menu-item{
      position: relative;
      display:flex;
      align-items center
      padding: 1em 1.3em;
      min-height:1.2em;
      color:var(--dropdown-menu-item__color,white)
      margin-bottom: 1px
      cursor:pointer;
      user-select: none

      background-color: var(--dropdown-menu-item__background,#000000cc);
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAHElEQVQYV2NkYGCQYmBgeMYABYwwBjYBsEoMFQBPvgIFqyjoxwAAAABJRU5ErkJggg==');

  }

  .dropdown-menu-item__icon{
    width 2em;
    align-self start
    margin-right: 0.5em;

    opacity:0.6
    transform: scale(0.8)
    transition: all 200ms 10ms
    &:hover{
      opacity:1
      transform: scale(1.1)
    }
  }

  .dropdown-menu-item__text{
     flex-grow:1
    .dropdown-menu-item__text__category{
      font-size:0.7em;
      opacity:0.6;
    }
  }

  .dropdown-menu-item__chips{
    padding:0.2em;
    min-width 1em;
    height 1em;
    text-align:center;
    border-radius: 0.25em;
    color:var(--dropdown-menu-item__color--active,black)
    background-color: var(--dropdown-menu-item__background--active,#000000cc);
    font-size:0.6em;
    line-height 0
    display inline-flex;
    align-items center
    justify-content center
  }

  .dropdown-menu-item__carret{
    margin-left:1em;
    align-self top
    opacity 0.5
  }

  //HOVER AND ACTIVE
  .dropdown-menu-item.active,
  .dropdown-menu-item:hover
  {
      &:hover{
           color:var(--dropdown-menu-item__color--hover,black)
           background-color: var(--dropdown-menu-item__background--hover,#000000cc);
      }
      &.active{
           color:var(--dropdown-menu-item__color--active,black)
           background-color: var(--dropdown-menu-item__background--active,#000000cc);
      }

    .dropdown-menu-item__chips{
       color:var(--dropdown-menu-item__color,black)
       background-color: var(--dropdown-menu-item__background,#000000cc);
    }

    }

   .sub-menu{
      position:fixed;
      z-index:10
      // left:100%;
   }

</style>

<docs>

```vue
<div>
  <dropdown-menu-item > Menu item </dropdown-menu-item>
  <dropdown-menu-item > Menu item 2 </dropdown-menu-item>
  <dropdown-menu-item category-text="CATEGORY TEXT" text="Menu item 3" chips-text="2" :has-submenu="true"></dropdown-menu-item>
</div>
```

```vue
<dropdown-menu-item :multiple="true"> Menu Item Multiple </dropdown-menu-item>
<dropdown-menu-item :multiple="true" :active="true"> Menu Item Multiple </dropdown-menu-item>
<dropdown-menu-item :multiple="true" :has-submenu="true"> Menu Item Multiple w submenu sadf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asfsda as dgsd gf sdf gsd fgs dfgsdfg sdfgsdf gsdfgs dfgsd fgsdfg sdfg sdfgsdf gsdfs </dropdown-menu-item>
```

```vue
<div>
  <dropdown-menu-item category-text="CATEGORY TEXT" text="Menu item 3" chips-text="2" :has-submenu="true">
      <template #menuItemText="slotProps">
            <h2>{{slotProps.props.text}}</h2>
      </template>
  </dropdown-menu-item>
</div>
```
</docs>
