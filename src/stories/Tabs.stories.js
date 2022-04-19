import Tabs from "@/components/ui/Tabs";

export default {
    title: "Tabs",
    component: Tabs,
    argTypes: {
        tabs: {
            type: 'object',
            defaultValue: [
                {
                    anchor: '#1',
                    text: 'Item 1'
                },
                {
                    anchor: '#2',
                    text: 'Item 2'
                },
                {
                    anchor: '#3',
                    text: 'Item 3'
                },
            ],
        }
    }
}


const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Tabs },
  template: `<Tabs v-bind="$props"></Tabs>`,
});

export const Default = Template.bind({});
