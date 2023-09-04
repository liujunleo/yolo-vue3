import { h, createTextVNode } from '../../lib/yolo-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    render() {
        const slots = {
            default: () => h('p', {}, 'fooSlot - defualt'),
            header: ({row, title}) => 
                [
                    h('p', {}, 'fooSlot - header'), 
                    h('p', {}, `fooSlot - header - scoped: ${row.age} ${title}`),
                    createTextVNode('文本节点内容')
                ],
            footer: () => h('p', {}, 'fooSlot - footer')
        }
        return h('div', { class: 'App' }, 
            [
                h('p', {}, 'App'), 
                h(Foo, {}, slots)
            ]
        )
        // 等同于 template：
        // <div class="App">
        //    <p>App</p>
        //    <Foo>
        //        <p>fooSlot - defualt</p>
        //        <template #header={row, title}>
        //            <p>fooSlot - header</p>
        //            <p>fooSlot - header - scoped: {{ row.age }} {{ title }}</p>
        //        </template>
        //        <template v-slot:footer>
        //            <p>fooSlot - footer</p>
        //        </template>
        //    </Foo>
        // </div>
    },
    setup() {
       
    }
}