import { h, ref } from '../../lib/yolo-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        let count = ref(0)
        const countClick = () => {
            count.value++
            console.log(count.value)
        }

        // update props
        let props = ref({ foo: 'foo', bar: 'bar' })
        const changeProp1 = () => {
            props.value.foo = 'foo-new'
        }
        const changeProp2 = () => {
            props.value.foo = null
        }
        const changeProp3 = () => {
            props.value = {
                foo: 'foo-only'
            }
        }
        return {
            count,
            countClick,
            changeProp1,
            changeProp2,
            changeProp3,
            props
        }
    },
    render() {
        return h(
            'div', { ...this.props },
            [
                h('p', {}, `count: ${this.count}`),
                h('button', { onClick: this.countClick }, 'count++'),
                h('br'),
                h('button', { onClick: this.changeProp1}, 'changeProp1 - foo-new'),
                h('button', { onClick: this.changeProp2}, 'changeProp2 - foo-null'),
                h('button', { onClick: this.changeProp3}, 'changeProp3 - foo-only')
            ]
        )
    }
}