<template>
  <!-- <v-container fluid> -->
  <v-row height="10vh">
    <v-col sm="12">
      <v-expansion-panels style="text-align: left" v-model="panel">
        <v-col
          :sm="isHovered.name !== catalog.name ? 4 : 4"
          v-for="(catalog, key) in catalog"
          :key="catalog.name"
        >
          <v-card dense class="mx-0 configure elevation-4">
            <v-expansion-panel
              v-model="panel"
              expand
              @click="isHovered = catalog"
            >
              <v-expansion-panel-header
                :color="isHovered.name == catalog.name ? 'grey' : 'light'"
              >
                <v-toolbar-title
                  class="pl-0"
                  v-bind:style="{
                    color: getColor(
                      key,
                      0.95,
                      isHovered.name == catalog.name,
                      false
                    ),
                    fontSize: '0.9em',
                  }"
                >
                  {{ catalog.title ? catalog.title : catalog.name }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-badge
                  v-if="catalog.status && catalog.status.installed"
                  x-small
                  :color="
                    catalog.status && catalog.status.latest_installed
                      ? 'green'
                      : 'orange darken-2'
                  "
                >
                  <template v-slot:badge>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-icon x-small v-on="on">
                          {{
                            catalog.status.latest_installed &&
                            catalog.status.latest_installed
                              ? "$check"
                              : "$exclamation"
                          }}
                        </v-icon>
                      </template>
                      {{
                        catalog.status.latest_installed
                          ? "Latest Installed"
                          : "Module not at the latest"
                      }}
                    </v-tooltip>
                  </template>
                </v-badge>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card-actions>
                  <v-autocomplete
                    v-model="stagedRemote"
                    :items="catalog.remotes"
                    :disabled="!(catalog.remotes && catalog.remotes.length > 0)"
                    outlined
                    :hint="`Choose remote version to load`"
                    persistent-hint
                    item-text="version"
                    item-value="version"
                    :item-disabled="'loaded'"
                    :item-color="'primary'"
                    dense
                    :label="
                      catalog.remotes && catalog.remotes.length > 0
                        ? 'Remote Versions'
                        : 'No Remote Versions'
                    "
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-avatar left>
                        <v-icon x-small>{{
                          item.icon ? "$" + item.icon : "cog"
                        }}</v-icon>
                      </v-list-item-avatar>

                      <v-list-item-content outlined class="">
                        <v-list-item-title>{{
                          item.version ? item.version : "No Version Available"
                        }}</v-list-item-title>

                        <v-spacer></v-spacer>
                        <v-list-item-subtitle>
                          <v-chip
                            x-small
                            v-for="(tag, tagKey) in item.tags"
                            :key="tagKey"
                            class="mr-1"
                          >
                            {{ tag }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-subheader v-if="item.loaded">Installed</v-subheader>
                        <v-tooltip v-if="!item.loaded" bottom>
                          <template v-slot:activator="{ on }">
                            <v-icon
                              v-on="on"
                              small
                              color="light "
                              v-on:click="loadRemoteModule(item)"
                              style="text-align: right"
                              class="ml-2 configure"
                              >$download</v-icon
                            >
                          </template>
                          Load Remote Module
                        </v-tooltip>
                      </v-list-item-action>
                    </template>
                    <template
                      v-if="stagedRemote && !stagedRemote.loaded"
                      v-slot:append
                    >
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-on="on"
                            small
                            color="light "
                            v-on:click="loadRemoteModule(stagedRemote)"
                            style="text-align: right"
                            class="ml-2 configure"
                            >$download</v-icon
                          >
                        </template>
                        Load Remote Module
                      </v-tooltip>
                    </template>
                  </v-autocomplete>
                </v-card-actions>
                <v-card-actions> </v-card-actions>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-col>
      </v-expansion-panels>
      <v-col sm="12">
        <SubLibrary
          :catalog="isHovered"
          :latest="isHovered.latest_version"
          v-if="selectedModule.name"
        >
        </SubLibrary>
        <Docker />
      </v-col>
    </v-col>
  </v-row>
</template>

<script>
const path = require("path");
import FileService from "@/services/File-service.js";
export default {
  name: "library",
  components: {},
  data() {
    return {
      remotelocation:
        process.env.NODE_ENV == "development" ? "stagedModules" : "modules",
    };
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  props: ["latestLibrary", "importedLibrary"],
  computed: {},

  mounted() {
    const $this = this;
    // this.fetchAllRemoteLibrary('modules')
    setInterval(() => {
      $this.getStatus();
    }, 4000);

    console.log(this.catalog);
  },
  watch: {},

  methods: {
    importModule(name) {
      this.$emit("importModule", { name: name, jump: false });
    },
    uniqueVersions(name) {
      let versions = this.importedLibrary[name].choices.map((f) => {
        return f.version ? f.version : 0;
      });
      return [...new Set(versions)];
    },
    async fetchRemoteCatalog(name) {
      const $this = this;
      let location = this.remotelocation;
      FileService.fetchRemoteCatalog(location, name).catch((err) => {
        this.$swal.fire({
          position: "center",
          icon: "error",
          showConfirmButton: true,
          title: err.response.data.message,
        });
      });
    },
    jump(name) {
      this.$emit("jumpTo", name);
    },
    async removeModule(name) {
      this.$swal({
        title: "Are you sure you want to remove this library?",
        text: "All dependencies will remain, but the ",
        type: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Remove module & dependencies`,
        denyButtonText: `Remove from Imports`,
      }).then((res) => {
        if (res.value != "cancel" && res.isConfirmed) {
          FileService.removeModule({
            catalog: name,
            dependencies: true,
          })
            .then((response) => {
              this.$swal.fire({
                position: "center",
                icon: "success",
                showConfirmButton: true,
                title: response.data.message,
              });
            })
            .catch((err) => {
              console.error(err);
              this.$swal.fire({
                position: "center",
                icon: "error",
                showConfirmButton: true,
                title: error.response.data.message,
              });
            });
        } else if (res.value != "cancel" && res.isDenied) {
          FileService.removeModule({
            catalog: name,
          })
            .then((response) => {
              this.$swal.fire({
                position: "center",
                icon: "success",
                showConfirmButton: true,
                title: response.data.message,
              });
            })
            .catch((err) => {
              console.error(err);
              this.$swal.fire({
                position: "center",
                icon: "error",
                showConfirmButton: true,
                title: error.response.data.message,
              });
            });
        }
      });
    },
    open_external(url) {
      this.$electron.shell.openExternal(url);
    },
    latestImported(name, version) {
      if (
        name &&
        this.importedLibrary[name] &&
        this.importedLibrary[name].latest.version == version
      ) {
        return "latest";
      } else if (
        name &&
        this.importedLibrary[name] &&
        this.importedLibrary[name].latest.version < version
      ) {
        return "notlatest";
      } else {
        return false;
      }
    },
    open(link) {
      try {
        this.$electron.shell.openPath(link);
      } catch (err) {
        this.$swal.fire({
          position: "center",
          icon: "error",
          showConfirmButton: true,
          title: "Could not open the path: " + link,
        });
      }
    },
    openDir(loc, format) {
      if (format == "file") {
        this.open(path.dirname(loc));
      } else {
        this.open(path.dirname(loc));
      }
    },
  },
};
</script>
<style>
#moduleconfig {
  width: 100%;
}
</style>