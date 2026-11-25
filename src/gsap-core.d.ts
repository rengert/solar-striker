// gsap without its CSSPlugin (-23 kB): every tween here targets Pixi objects, never DOM elements
declare module 'gsap/gsap-core' {
  export * from 'gsap';
  export { default } from 'gsap';
}
