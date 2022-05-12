import Tag from "@/components/ui/Tag.vue";

export default {
  title: "Tag",
  component: Tag,
  argTypes: {
    text: {
        control: {type: 'text'},
        defaultValue: 'Tag',
    },
    color: {
        control: { type: 'select' },
        options: ['black', 'blue', 'blue-light', 'green', 'green-light'],
    },
  }
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Tag },
  template: `<tag v-bind="$props"></tag>`,
});

export const Black = Template.bind({});
Black.args = {
    text: 'Tag',
    color: 'black'
}

export const Blue = Template.bind({});
Blue.args = {
    text: 'Tag',
    color: 'blue'
}

export const BlueLight = Template.bind({});
BlueLight.args = {
    text: 'Tag',
    color: 'blue-light'
}

export const Green = Template.bind({});
Green.args = {
    text: 'Tag',
    color: 'green'
}

export const GreenLight = Template.bind({});
GreenLight.args = {
    text: 'Tag',
    color: 'green-light'
}