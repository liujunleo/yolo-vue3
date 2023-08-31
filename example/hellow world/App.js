import { h } from '../../lib/yolo-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    render() {
    window.self = this
    return h(
            'div', 
            {
                id: 'test',
                onClick: ()=> {
                    console.log('onClick')
                }
            },
            // `Hello ${this.msg}!`
            //`hello world!`
            [
                h('div',{ id: 'AppId' }, `Hello ${this.msg}!`),
                h(Foo, { count: 1 }),
            ]
        )
    },
    setup() {
        return {
            msg: 'World'
        }
    }
}