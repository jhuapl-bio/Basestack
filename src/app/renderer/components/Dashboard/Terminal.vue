<template><div  style=" height: 100%; " class="mx-2 my-2 console" id="terminal"></div></template>

<script>
import "xterm/css/xterm.css";

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { ipcRenderer } from 'electron'



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

export default {
  name: 'Console',
  props: {
    terminal: {
      type: Object,
      default: {}
    },
    msg: String,
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
    terminal: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      term: null,
      terminalSocket: null
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
  /*
    created : function () {
      console.log('---created----');
      if (typeof this.$_terminal === 'undefined') {
         this.initTerminal()
      }
    },
  */
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
    this.$electron.ipcRenderer.on('terminal-incData', (evt) => {
      console.log(evt)
    })

    const $this=this
    let terminalContainer = document.getElementById('terminal')
    let term = this.term = new Terminal({
      cursorBlink: true,
      cols: this.terminal.cols,
      rows: this.terminal.rows,
      fontSize: 18,
      cursorStyle: 'bar',  
      bellStyle: 'sound',
      theme: this.theme,
      ...this.option,
    }) 
    const fitAddon = new FitAddon();
    this.term.loadAddon(fitAddon);
    this.term.open(terminalContainer);
     

    this.term.loadAddon(new WebLinksAddon());
    this.term._initialized = true
    process.env.terminal = this.term
    fitAddon.fit(); 

    this.term.prompt = () => {
      this.term.write('\r\n')
    } 
    
    

    this.term.writeln('Welcome to xterm.js');
    this.term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
    this.term.writeln('Hit Enter to Begin');
    this.term.prompt()
    $this.$electron.ipcRenderer.send('terminal-into', '\r\n');
    this.$electron.ipcRenderer.on('terminal-incData', (event, data) => {
      $this.term.write(data);
    })

    // //キー入力 
    this.term.onKey((key) => {
      let ev = key.domEvent
      
      if (ev.keyCode == 13) {
        $this.$electron.ipcRenderer.send('terminal-into', key.key);
      } else if (ev.keyCode === 8) {        
        // Do not delete the prompt
        if (term._core.buffer.x > 0) {
          // term.write('\b \b');
          $this.$electron.ipcRenderer.send('terminal-into', '\b \b');
        }
        return false;
      } else {
        // term.write(key.key);
        $this.$electron.ipcRenderer.send('terminal-into', `${key.key}`);
        return
      }


    });



    //受信
    // ipcRenderer.on('terminal', (event, arg) => {
    //   console.log(event, arg,"ipcrender");
    //   $this.term.write(arg);
    // })



  },

  beforeDestroy() {
    console.log('-------');
    console.log(this);
    // this.term.destroy()
  },
  methods: {
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

    clear() {
      this.$_terminal.clear()
    },

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
}
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