<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
    <div> 
        <v-btn @click="navigation.shown = !navigation.shown">Toggle {{ direction }}</v-btn>
        <v-navigation-drawer ref="information_panel_drawer" app right :width="navigation.width" v-model="navigation.shown">
        </v-navigation-drawer>
    </div>
</template>

<script>
export default {
	name: 'sidebar',
    data() {
        return {
            navigation: {
                shown: true,
                width: 550,
                borderSize: 3
            },
        }
    },
    computed: {
        direction() {
            return this.navigation.shown === false ? "Open" : "Closed";
        }
    },
    methods: {
        setBorderWidth() {
            let i = this.$refs.information_panel_drawer.$el.querySelector(
                ".v-navigation-drawer__border"
            );
            i.style.width = this.navigation.borderSize + "px";
            i.style.cursor = "ew-resize";
        },
        setEvents() {
            const minSize = this.navigation.borderSize;
            const el = this.$refs.information_panel_drawer.$el;
            const drawerBorder = el.querySelector(".v-navigation-drawer__border");
            const vm = this;
            const direction = el.classList.contains("v-navigation-drawer--right")
                ? "right"
                : "left";

            function resize(e) {
                document.body.style.cursor = "ew-resize";
                let f = direction === "right"
                    ? document.body.scrollWidth - e.clientX
                    : e.clientX;
                el.style.width = f + "px";
            }

            drawerBorder.addEventListener(
                "mousedown",
                function (e) {
                    if (e.offsetX < minSize) {
                        let m_pos = e.x;
                        el.style.transition = 'initial'; document.addEventListener("mousemove", resize, false);
                    }
                },
                false
            );

            document.addEventListener(
                "mouseup",
                function () {
                    el.style.transition = '';
                    vm.navigation.width = el.style.width;
                    document.body.style.cursor = "";
                    document.removeEventListener("mousemove", resize, false);
                },
                false
            );
        }
    },
	props: ['shown'],
    mounted() {
        this.setBorderWidth();
        this.setEvents();
    },
    watch: {
        shown(newVal) {
            this.navigation.shown  = shown
        }
    }
    
};
</script>
