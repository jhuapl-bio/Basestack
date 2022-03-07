import ModuleCard from '../app/renderer/components/ui/ModuleCard.vue'

export default {
  title: 'Cards/Module Card',
  component: ModuleCard,
  argTypes: {
    moduleName: {
        control: {type: 'text'},
        defaultValue: 'Module Name',
    },
    description: {
        control: {type: 'text'},
        defaultValue: 'Mauris vestibulu, lorem a aliquet imperdiet turpis mi vehicula turpi, quis…',
    },
    version: {
        control: {type: 'text'},
        defaultValue: '2.356',
    },
    hasUpdateAvailable: {
        control: {type: 'boolean'},
        defaultValue: false,
    },
    compactView: {
        control: {type: 'boolean'},
        defaultValue: false,
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {ModuleCard},
  template: `
    <module-card v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {}

export const Compact = Template.bind({})
Compact.args = {

    compactView: true,
  }