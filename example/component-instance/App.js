import { h, getCurrentInstance } from '../../lib/yolo-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    setup() {
       const instance = getCurrentInstance()
       console.log('App:',instance)
    },
    render() {
        return h('div', {}, [h('p', {}, 'App'), h(Foo, {})])
    }
}