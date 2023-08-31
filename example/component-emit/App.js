import { h } from '../../lib/yolo-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    render() {
        return h(
            'div', 
            {},
            [
                h('p', {}, 'App - p'),
                h(Foo, { onTestEmit: this.onTest }),
            ]
        )
    },
    setup() {
        function onTest(result) {
            console.log(`App - onTest： ${JSON.stringify(result)}`)
        }
        return {
            onTest
        }
    }
}