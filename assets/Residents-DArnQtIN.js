import{c as r,u as y,r as d,a as S,n as w,o as x,j as e,p as N,B as M,S as C,q as A,E as _,t as $,v as b,A as R,M as D,w as T,x as F,l as B,y as L}from"./index-DBc3kZ8Z.js";/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j={name:"arrow-down-right",size:24,node:[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]]};j.node;const O=r(j);/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u={name:"arrow-up-right",size:24,node:[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]};u.node;const E=r(u);/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g={name:"funnel",size:24,node:[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],aliases:["filter"]};g.node;const I=r(g);/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v={name:"minus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}]]};v.node;const U=r(v);/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z={name:"search",size:24,node:[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]};z.node;const q=r(z);function P({resident:o}){if(o.participation==null)return e.jsx("span",{className:"trend-pill",children:"Baseline in costruzione"});const{tone:n,label:l}=L(o),t={up:E,down:O,flat:U}[n];return e.jsxs("span",{className:`trend-pill trend-${n}`,children:[e.jsx(t,{size:14}),"Partecipazione ",l]})}function Q(){const{state:o}=y(),[n,l]=d.useState(""),[t,f]=d.useState("Tutte"),h=S(),p=d.useMemo(()=>o.residents.filter(s=>(t==="Tutte"||s.mode===t)&&`${s.name} ${s.room} ${s.interests.join(" ")}`.toLowerCase().includes(n.toLowerCase())).map(s=>({resident:s,attention:w(s.id)})).sort((s,i)=>x(i.resident.id)-x(s.resident.id)),[o.residents,n,t]);return e.jsxs("div",{className:"screen-enter",children:[e.jsx(N,{eyebrow:"Persone",title:"Ospiti",description:"Come sta ogni persona e come avvicinarla. Prima chi ha bisogno di più attenzione. L'anagrafica resta nel gestionale della struttura.",action:e.jsxs(M,{variant:"outline",onClick:()=>h("/"),children:[e.jsx(C,{size:16})," Chiedi a ROSS"]})}),e.jsxs("div",{className:"filter-bar",children:[e.jsxs("label",{children:[e.jsx(q,{size:17}),e.jsx("input",{value:n,onChange:s=>l(s.target.value),placeholder:"Cerca nome, stanza o interesse"})]}),e.jsxs("div",{children:[e.jsx(I,{size:16}),e.jsx(A,{value:t,onValueChange:f,label:"Modalità",options:["Tutte","Attiva","Reattiva","Silenziosa"].map(s=>({value:s,label:s==="Tutte"?"Tutte le modalità":s}))})]})]}),p.length?e.jsx("div",{className:"residents-grid",children:p.map(({resident:s,attention:i})=>{var m;const c=$(s.id).find(a=>a.positive),k=b(s.id).some(a=>a.kind==="assenza");return e.jsxs("article",{className:"resident-card surface",onClick:()=>h(`/ospiti/${s.id}`),children:[e.jsxs("header",{children:[e.jsx(R,{resident:s,size:"lg"}),e.jsxs("div",{children:[e.jsx("h3",{children:s.name}),e.jsxs("p",{children:[s.age," anni · stanza ",s.room]})]}),e.jsx(D,{mode:s.mode})]}),e.jsxs("div",{className:"resident-presence",children:[e.jsx(T,{size:15}),e.jsx("span",{children:k?e.jsxs(e.Fragment,{children:["Ultima conversazione con ROSS: ",e.jsx("strong",{children:s.lastInteraction})]}):e.jsxs(e.Fragment,{children:["Ultima conversazione con ROSS: ",e.jsxs("strong",{children:["oggi alle ",s.lastInteraction]})]})})]}),e.jsx(P,{resident:s}),e.jsxs("div",{className:"resident-attention",children:[i.length?i.slice(0,2).map(a=>e.jsxs("span",{className:`attention-chip attention-${a.tone}`,children:[a.tone==="watch"?"Da osservare":"Bisogno"," · ",a.text]},a.text)):c?e.jsxs("span",{className:"attention-chip attention-ok",children:[c.signal.charAt(0).toUpperCase(),c.signal.slice(1)," espressa · ",c.trend]}):e.jsx("span",{className:"attention-chip attention-ok",children:"Nessun segnale particolare"}),i.length>2&&e.jsxs("small",{children:["+",i.length-2]})]}),e.jsxs("footer",{children:[e.jsx("div",{children:(((m=F[s.id])==null?void 0:m.interests)||s.interests.map(a=>[a])).slice(0,3).map(([a])=>e.jsx("span",{children:a},a))}),e.jsx(B,{size:18})]})]},s.id)})}):e.jsx(_,{})]})}export{Q as Residents};
