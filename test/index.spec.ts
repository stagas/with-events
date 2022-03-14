import { withEvents } from '../src'

let x = 0

describe('withEvents(Base)', () => {
  it('extends dispatchEvent', () => {
    let count = 0
    const Foo = withEvents<{ foo: CustomEvent }>(HTMLElement)
    customElements.define('x-foo' + ++x, Foo)
    const foo = new Foo()
    foo.onfoo = () => count++
    foo.dispatchEvent(new CustomEvent('foo'))
    expect(count).toBe(1)
  })

  it('types detail properties', () => {
    let result
    const Foo = withEvents<{ foo: CustomEvent<{ bar: string }> }>(HTMLElement)
    customElements.define('x-foo2' + ++x, Foo)
    const foo = new Foo()
    foo.onfoo = ({ detail }) => (result = detail.bar)
    foo.dispatchEvent(new CustomEvent('foo', { detail: { bar: 'hello' } }))
    expect(result).toBe('hello')
  })

  it('reference in attribute string', () => {
    let count = 0
    const Foo = withEvents<{ foo: CustomEvent }>(HTMLElement)
    customElements.define('x-foo3' + ++x, Foo)
    const foo = new Foo()
    ;(globalThis as any).callglobal = () => count++
    foo.setAttribute('onfoo', 'callglobal')
    foo.dispatchEvent(new CustomEvent('foo'))
    expect(count).toBe(1)
  })

  it('expression in attribute string', () => {
    let count = 0
    const Foo = withEvents<{ foo: CustomEvent }>(HTMLElement)
    customElements.define('x-foo3' + ++x, Foo)
    const foo = new Foo()
    ;(globalThis as any).globalRef = () => count++
    foo.setAttribute('onfoo', 'globalRef=42')
    foo.dispatchEvent(new CustomEvent('foo'))
    expect((globalThis as any).globalRef).toBe(42)
  })

  it('return false inline', () => {
    let count = 0
    const Foo = withEvents<{ foo: CustomEvent }>(HTMLElement)
    customElements.define('x-foo' + ++x, Foo)
    const foo = new Foo()
    foo.onfoo = () => false
    foo.addEventListener('foo', () => count++)
    foo.dispatchEvent(new CustomEvent('foo'))
    expect(count).toBe(0)
  })

  it('with stopPropagation', () => {
    let count = 0
    const Foo = withEvents<{ foo: CustomEvent }>(HTMLElement)
    customElements.define('x-foo' + ++x, Foo)
    const foo = new Foo()
    foo.onfoo = e => {
      e.stopPropagation()
    }
    foo.addEventListener('foo', () => count++)
    foo.dispatchEvent(new CustomEvent('foo'))
    expect(count).toBe(0)
  })
})
