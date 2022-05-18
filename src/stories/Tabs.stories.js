import Tabs from "@/components/ui/Tabs";
import Tab from "@/components/ui/Tab";

export default {
  title: "Tabs",
  component: Tabs,
  subcomponents: { Tab },
  argTypes: {
    tabs: {
      type: "object",
      defaultValue: [
        {
          name: "My Procedures",
          selected: true,
          content: "Tab #1",
        },
        {
          name: "My Modules",
          selected: false,
          content: "Tab #2",
        },
        {
          name: "Browse All Modules",
          selected: false,
          content: "Tab #3",
        },
      ],
    },
  },
};

export const Default = (args, { argTypes }) => {
  console.log({ args: args, argTypes: argTypes, props: Object.keys(argTypes) });
  return {
    props: Object.keys(argTypes),
    components: { Tabs, Tab },
    template: `
            <Tabs>
                <Tab v-for="(tab, index) in $props.tabs" :key="index" :name="tab.name">
                    <template v-slot>{{tab.content}}</template>
                </Tab>
            </Tabs>
            `,
  };
};
