import Dropdown from './Dropdown.vue'

const regioes = [{
  text: 'Estados',
  value: null,
  submenu: {
    key: 'geocod-estados',
    multiple: true,
    options: [
      {
        text: 'Rio de Janeiro',
        value: 13,
        submenu: {
          key: 'municipios',
          multiple: true,
          options: [{ text: 'Nova Friburgo', value: 'novafriburgo' }, { text: 'Rezende', value: 'rezende' }]
        }
      },
      {
        text: 'Brasília',
        value: 51
      },
      {
        text: 'São Paulo',
        value: 40,
        submenu: {
          key: 'municipios',
          multiple: false,
          options: [{ text: 'Campinas', value: 'campinas' }, { text: 'Santo Andre', value: 'santoandre' }]
        }
      }
    ]
  }
},
{
  text: 'Região Metropolitana',
  value: null,
  submenu: {
    key: 'geocod-regiao-metropolitana',
    multiple: true,
    options: [
      {
        text: 'Grande São Paulo',
        value: 13
      },
      {
        text: 'Regiao Metropolitana 2',
        value: 51
      },
      {
        text: 'Regiao Metropolitana 4',
        value: 40
      }
    ]
  }
},
{ text: 'Brasil', value: 0 }

]

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  argTypes: {
    color: { control: 'color' },
    options: [{ text: 'default', value: '1' }],
    multiple: true
  }
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Dropdown },
  template: `<div>
        <dropdown v-model="value" :multiple="multiple" :label="label" :options="options"></dropdown>
        value <pre>{{value}}</pre>
    </div>
    `
})

export const SingleSeclection = Template.bind({})
SingleSeclection.args = {
  options: regioes,
  label: 'regioes',
  value: null,
  multiple: true
}

export const MultipleSelection = Template.bind({})
MultipleSelection.args = {
  options: regioes,
  multiple: true
}