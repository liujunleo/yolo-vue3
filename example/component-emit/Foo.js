import { h } from "../../lib/yolo-vue.esm.js"

export const Foo = {
    name: 'Foo',
    render() {
       return h(
            'button',
            {
                onClick: this.myClick
            }, 
            'Foo - 测试 emit'
        )
    },
    setup(props, { emit }) {
        function myClick() {
            console.log('Foo - onClick')
            emit('test-emit', {callback: 'leo'})
        }
        return {
            myClick
        }
    }
}