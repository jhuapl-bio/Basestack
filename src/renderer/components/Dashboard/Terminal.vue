<template>
  <div  style=" height: 100%; " class="mx-2 my-2 console" id="terminal">
    <v-btn @click="clear">Clear</v-btn>
    <v-btn @click="restartTerminal">Refresh</v-btn>
    </div>
</template>

<script lang="ts" >
import "xterm/css/xterm.css";

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';



const defaultTheme = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff'
}

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030'
}

interface State {
  term: any,
  terminalSocket: any,
}
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Terminal',
  props: {
    terminal: {
      type: Object,
      default: {}
    },
    cols: {
      type: Number,
      required: true
    },
    rows: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      default: undefined
    },
    autoSize: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },

    title: {
      type: String,
      default: null
    },

    openLinks: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      term: null,
      terminalSocket: null,
    }
  },
  computed: {
    theme() {
      if (this.darkMode) {
        return darkTheme
      } else {
        return defaultTheme
      }
    }
  },
  watch: {
    cols(c) {
      this.$_terminal.resize(c, this.rows)
    },
    rows(r) {
      this.$_terminal.resize(this.cols, r)
    },
    content: 'setContent',

    darkMode(value, oldValue) {
      if (typeof oldValue === 'undefined') {
        this.initTerminal()
      } else if (this.$_terminal) {
        this.$_terminal.setOption('theme', this.theme)
      }
    }

  },

  mounted() { // Code heavily influenced by https://github.com/nojaja/ElectronTerminal/
    console.log('-------');
    this.restartTerminal()
    let terminalContainer = this.terminalContainer = document.getElementById('terminal')
    this.init()






  },

  beforeDestroy() {
    console.log('-------');
    console.log(this);
    // this.term.destroy()
  },
  methods: {
    async restartTerminal() {
      console.log(`restart terminal`) 
      window.electronAPI.terminalRestart('\r\n')
    },
    async init() {
      const $this = this
      if (this.term) {
        try {
          await this.term.dispose()
        } catch (err) {
          console.error(err)
        }
      }
      let term = this.term = new Terminal({
        cursorBlink: true,
        cols: this.terminal.cols,
        rows: this.terminal.rows,
        fontSize: 18,
        cursorStyle: 'bar',
        bellStyle: 'sound',
        convertEol: true,
        theme: this.theme,
        ...this.option,
      })
      console.log(term,"<<<")
      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);
      this.term.open(this.terminalContainer);


      this.term.loadAddon(new WebLinksAddon());
      this.term._initialized = true
      fitAddon.fit();
      // this.term.prompt = () => { 
      //   $this.term.write('\r\n')
      // }
      
      this.term.writeln('Welcome to xterm.js');
      this.curr_line = ''
      window.electronAPI.terminalInc((event: any, message: string) => {
        $this.term.write(`${message}`)
      })
      this.term.onKey((key) => {
        let ev = key.domEvent
        if (ev.keyCode == 13) {
          window.electronAPI.terminalRun('\n');
          window.electronAPI.logger(`${key.key} entered, ${$this.curr_line}, running command in xterm.js`)
          $this.curr_line = ''
          return false
        } else if (ev.keyCode === 8) {     
          // Do not delete the prompt
           if (this.term._core.buffer.x > 0) {
            $this.curr_line = this.curr_line.slice(0, -1);
            window.electronAPI.terminalInto('\b \b');
          }
          return false;
        } else {
          $this.curr_line += key.key;
          window.electronAPI.terminalInto(`${key.key}`)
          return
        }
      });
    },
    async clear() {
      this.$electron.ipcRenderer.send('terminal-restart');
      await this.term.reset()
      this.init()
    },
    setContent(value, ln = true) {
      if (value.indexOf('\n') !== -1) {
        value.split('\n').forEach(
          t => this.setContent(t)
        )
        return
      }
      if (typeof value === 'string') {
        this.$_terminal[ln ? 'writeln' : 'write'](value)
      } else {
        this.$_terminal.writeln('')
      }
    },

    addLog(log) {
      this.setContent(log.text, log.type === 'stdout')
    },

    // clear() {
    //   this.$_terminal.clear()
    // },

    scrollToBottom() {
      this.$_terminal.scrollToBottom()
    },

    handleLink(event, uri) {
      if (this.openLinks) {
        window.open(uri, '_blank')
      }
      this.$emit('link', uri)
    },

    async fit() {
      let term = this.$_terminal
      term.element.style.display = 'none'

      await this.$nextTick()

      term.fit()
      term.element.style.display = ''
      term.refresh(0, term.rows - 1)
    },

    focus() {
      this.$_terminal.focus()
    },

    blur() {
      this.$_terminal.blur()
    }
  }
})
</script>



<!--
<style lang="stylus" scoped>
.terminal-view
  v-box()
  align-items stretch

  .view
    flex 100% 1 1
    height 0
    position relative
    padding-left $padding-item

  .xterm-render
    width 100%
    height 100%
    >>> .xterm
      .xterm-cursor-layer
        display none
</style>
-->