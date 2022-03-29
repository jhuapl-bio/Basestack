import ModuleLibraryCard from '../app/renderer/components/ui/ModuleLibraryCard.vue'

export default {
  title: 'Cards/Module Library',
  component: ModuleLibraryCard,
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
  components: {ModuleLibraryCard},
  template: `
    <module-library-card v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {}

export const Compact = Template.bind({})
Compact.args = {
    compactView: true,
}

export const HasUpdate = Template.bind({})
HasUpdate.args = {
    hasUpdateAvailable: true,
}