import Tabs from "@/components/ui/Tabs";
import Tab from "@/components/ui/Tab"

export default {
    title: "Tabs",
    component: Tabs,
    subcomponents: { Tab },
    argTypes: {
        tabs: {
            type: 'object',
            defaultValue: [
                {
                    name: 'My Procedures',
                    selected: true,
                    content: "Tab #1"
                },
                {
                    name: 'My Modules',
                    selected: false,
                    content: "Tab #2"
                },
                {
                    name: 'Browse All Modules',
                    selected: false,
                    content: "Tab #3"
                },
            ],
        }
    }
}


const Template = (args, { argTypes }) => {
    console.log({args: args, argTypes: argTypes, props: Object.keys(argTypes)})
    return {
        props: Object.keys(argTypes),
        components: { Tabs },
        subcomponents: { Tab },
        template: `
            <Tabs>
                <Tab v-for="(tab, index) in $props.tabs" :key="index" :v-slot="tab.content" />
            </Tabs>
            `,
    }
};

export const Default = Template.bind({});
