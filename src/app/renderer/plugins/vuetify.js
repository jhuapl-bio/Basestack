

import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas, far } from '@fortawesome/free-solid-svg-icons'

 
import { faLock,faExclamationTriangle, faEdit, faCircle, faChessRook, faServer, faChessPawn, faChess, faCaretSquareUp, faStepBackward,  faStepForward, faCaretDown, faArrowAltCircleRight, faArrowAltCircleLeft,  faSquare, faSquareFull, faEnvelope, faDownload,   faChevronLeft, faChevronRight, faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, faExclamation, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle} from '@fortawesome/free-solid-svg-icons'
let list_icons_fa =  [
    "download", "exclamation-triangle", "server", "edit", "circle", "chess", "chess-pawn", "chess-rook",
    "envelope", "caret-square-up",
    "lock", 
    "square", "caret-down", "step-forward", "step-backward",
    "chevron-right", 
    "chevron-left", "binoculars", "chart-pie", 
    "highlighter", "anchor", "eternal-link-alt", 
    "book", "handshake-slash", "slash", "phone",  
    "unlock-alt", "check-circle", "user-lock", 
    "arrow-alt-circle-down", "home", "circle-notch", 
    "exclamation", "video", "times", "question-circle", 
    "comment", "comment-slash", "level-up-alt", 
    "play-circle", 
    "dna", "archive", "save", "wrench","angle-up", "check", 
    "times-circle", "angle-down", "plus", "minus", "chalkboard", 
    "trash-alt", "cog", "globe", "viruses", "book-open", 
    "tree",
    "hourglass-start", "stop-circle", "sync", "address-card", 
    "bars", 
    "arrow-alt-circle-right", "arrow-alt-circle-left",
    "minus-circle" ]
Vue.component('font-awesome-icon', FontAwesomeIcon)


library.add(
    faLock, faEnvelope, faServer, faCircle, faEdit, faExclamationTriangle, faChessPawn, faChessRook, faChess, faCaretSquareUp, faStepForward,  faStepBackward, faCaretDown, faSquare,  faSquareFull, faArrowAltCircleRight, faArrowAltCircleLeft,
    faDownload, faChevronLeft, faChevronRight,  
    faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, 
    faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, 
    faExclamation, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, 
    faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, 
    faViruses, faBookOpen, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle 
)


const CUSTOM_ICONS = {
    add: { // custom icon I want to use
        component: FontAwesomeIcon,
        props: {
            icon: ['far','square']
        }
    },
}
list_icons_fa.forEach((icon)=>{
    CUSTOM_ICONS[icon] = {
        component: FontAwesomeIcon,
        props: {
            icon: [ 'fa', icon]
        }
    }
})

Vue.use(Vuetify)

const opts = {
    theme: {
        error: "#a60139",
        primary: "#2b57b9",
            
    },
    icons: {
        iconfont: 'fa',
        values: CUSTOM_ICONS,

    },

 
}
 
export default new Vuetify(opts)