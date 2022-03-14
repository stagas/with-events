export interface EventHandler<T, E extends Event> {
  (e: E & { currentTarget: T; target: Element }): void
}

const Listener = (body: string) =>
  new Function(
    'event',
    `with(this){let fn=${body};return typeof fn=='function'?fn.call(this,event):fn}`
  )

/**
 * Constructs a base factory with modified `dispatchEvent` that
 * will invoke inline `onxxx` handlers as usual with HTML.
 *
 * ```ts
 * class Foo extends withEvents<{
 *   foo: CustomEvent<{ bar: string }>
 * }>(HTMLElement) {
 *   // your component here
 * }
 * customElements.define('x-foo', Foo)
 * const foo = new Foo()
 *
 * // this is now typed properly
 * foo.onfoo = ({ detail }) => console.log(detail.bar)
 * foo.dispatchEvent(new CustomEvent('foo', { detail: { bar: 'hello' } }))
 * // console => 'hello'
 * ```
 *
 * @param parent A HTMLElement derived class
 * @returns
 */
export const withEvents = <P extends Record<string, Event>>(parent: CustomElementConstructor) => {
  const Base = class extends parent {
    // based on: https://stackoverflow.com/a/49773201/175416
    dispatchEvent(event: Event) {
      const onEvent = `on${event.type}`
      let fn = (this as any)[onEvent]
      if (!fn) fn = Listener(this.getAttribute(onEvent)!)
      const pass = fn.call(this, event)
      if (pass !== false) super.dispatchEvent(event)
      return pass
    }
  }
  return Base as typeof Base & {
    new (): {
      [K in keyof P as `on${K extends string ? K : never}`]: EventHandler<
        InstanceType<typeof Base>,
        P[K]
      >
    }
  }
}
