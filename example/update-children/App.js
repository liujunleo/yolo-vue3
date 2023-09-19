import { h } from '../../lib/yolo-vue.esm.js'

import ArrayToText from './ArrayToText.js'
import TextToText from './TextToText.js'
import TextToArray from './TextToArray.js'
import ArrayToArray from './ArrayToArray.js'

export default {
    name: 'App',
    setup() {
    },
    render() {
        return h(
            'div', {},
            [
                h('p', {}, `App`),
                // array to text
                // h(ArrayToText),
                // text to text
                // h(TextToText),
                // text to array
                // h(TextToArray),
                // array to array
                h(ArrayToArray)
            ]
        )
    }
}