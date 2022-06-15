

import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas, far } from '@fortawesome/free-solid-svg-icons'

 
import { faLock, faDesktop, faBan, faVirus, faPuzzlePiece, faCampground, faCapsules, faMountain,  faChartArea, faChevronDown, faChevronUp, faEyeDropper, faChessKnight, faBroom, faMagic, faExclamationTriangle, faBolt, faBicycle, faFile, faRecycle, faCheckSquare, faFolder, faTags, faPencilAlt, faUpload, faQuestion, faEdit, faCircle, faChessRook, faServer, faChessPawn, faChess, faCaretSquareUp, faStepBackward,  faStepForward, faCaretDown, faArrowAltCircleRight, faArrowAltCircleLeft,  faSquare, faSquareFull, faEnvelope, faDownload,   faChevronLeft, faChevronRight, faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, faExclamation, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle} from '@fortawesome/free-solid-svg-icons'
let list_icons_fa =  [
    "download", "ban", "virus", "exclamation-triangle", "eye-dropper", "capsules", "mountain",  "server", "magic", "bolt", "magnifying-glass", "chess-knight", "broom", "campground", "edit", "file", "check-square", "circle", "chess", "chess-pawn", "upload", "chess-rook",
    "envelope", "caret-square-up", "tags", "bicycle", "desktop",
    "lock", "question", "external-link-alt",
    "square", "caret-down", "step-forward", "step-backward",
    "chevron-right", "chevron-down", "chevron-up",
    "chevron-left", "binoculars", "chart-pie", "chart-area",
    "highlighter", "anchor", "eternal-link-alt", 
    "book", "handshake-slash", "slash", "phone",  
    "unlock-alt", "check-circle", "user-lock", 
    "arrow-alt-circle-down", "home", "circle-notch", "recycle",
    "exclamation", "video", "times", "question-circle", 
    "comment", "comment-slash", "level-up-alt", 
    "play-circle",  
    "dna", "archive", "save", "wrench","angle-up", "check", 
    "times-circle", "angle-down", "plus", "minus", "chalkboard", 
    "trash-alt", "cog", "globe", "viruses", "book-open", "pencil-alt",
    "tree",
    "hourglass-start", "stop-circle", "sync", "puzzle-piece", "address-card", 
    "bars", 
    "arrow-alt-circle-right", "arrow-alt-circle-left", "folder",
    "minus-circle" ]
Vue.component('font-awesome-icon', FontAwesomeIcon)


library.add(
    faLock, faEnvelope, faBan, faVirus, faPuzzlePiece, faServer, faChevronDown, faCapsules, faChartArea, faChevronUp, faEyeDropper, faMountain, faChessKnight, faBroom, faMagic, faDesktop, faBolt, faCampground, faBicycle, faFile, faRecycle, faTags,faCircle, faCheckSquare, faEdit, faUpload, faExclamationTriangle, faChessPawn, faChessRook, faChess, faCaretSquareUp, faStepForward,  faStepBackward, faCaretDown, faSquare,  faSquareFull, faArrowAltCircleRight, faArrowAltCircleLeft,
    faDownload, faChevronLeft, faChevronRight,   faFolder, 
    faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, 
    faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, 
    faExclamation, faVideo, faTimes, faQuestionCircle, faQuestion, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, 
    faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, 
    faViruses, faBookOpen, faPencilAlt, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle 
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