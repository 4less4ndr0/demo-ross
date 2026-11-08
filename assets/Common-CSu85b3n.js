import{c as o,j as s,s as r}from"./index-9XVVrsCj.js";/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i={name:"circle-question-mark",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],aliases:["help-circle","circle-help"]};i.node;const l=o(i);/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t={name:"info",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]};t.node;const d=o(t),m=new Set(["antonio","lucia","mario","carlo","ada","bruno","elena","teresa"]),h=a=>m.has(a.id)?`/demo-ross/ospiti/${a.id}.webp`:null;function u({resident:a,size:e="md"}){const n=h(a);return s.jsx("span",{className:`avatar avatar-${e} avatar-${a.color||"mint"}${n?" avatar-photo":""}`,"aria-label":a.name,role:"img",children:n?s.jsx("img",{src:n,alt:"",loading:"lazy"}):a.initials})}function x({mode:a}){return s.jsxs("span",{className:`mode-badge mode-${a.toLowerCase()}`,children:[s.jsx("span",{}),a]})}function j({eyebrow:a,title:e,description:n,action:c}){return s.jsxs("div",{className:"section-heading",children:[s.jsxs("div",{children:[a&&s.jsx("span",{className:"eyebrow",children:a}),s.jsx("h2",{children:e}),n&&s.jsx("p",{children:n})]}),c]})}function g({title:a="Nessun risultato",description:e="Prova a cambiare filtri o ricerca.",icon:n=l}){return s.jsxs("div",{className:"empty-state",children:[s.jsx(n,{size:28}),s.jsx("strong",{children:a}),s.jsx("p",{children:e})]})}function v({children:a}){return s.jsxs("div",{className:"data-explanation",children:[s.jsx(d,{size:15}),a]})}function y({className:a="",alt:e=""}){return s.jsx("img",{src:r("ross-logo.svg"),alt:e,"aria-hidden":e?void 0:!0,className:`ross-logo ${a}`.trim()})}export{u as A,l as C,v as D,g as E,x as M,y as R,j as S,h as r};
