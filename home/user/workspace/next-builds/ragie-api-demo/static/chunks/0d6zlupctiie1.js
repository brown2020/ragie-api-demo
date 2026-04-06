(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,5766,e=>{"use strict";let t,a;var r,s=e.i(71645);let i={data:""},o=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,d=(e,t)=>{let a="",r="",s="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?a=i+" "+o+";":r+="f"==i[1]?d(o,i):i+"{"+d(o,"k"==i[1]?"":t)+"}":"object"==typeof o?r+=d(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=d.p?d.p(i,o):i+":"+o+";")}return a+(t&&s?t+"{"+s+"}":s)+r},c={},u=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+u(e[a]);return t}return e};function m(e){let t,a,r=this||{},s=e.call?e(r.p):e;return((e,t,a,r,s)=>{var i;let m=u(e),p=c[m]||(c[m]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(m));if(!c[p]){let t=m!==e?e:(e=>{let t,a,r=[{}];for(;t=o.exec(e.replace(l,""));)t[4]?r.shift():t[3]?(a=t[3].replace(n," ").trim(),r.unshift(r[0][a]=r[0][a]||{})):r[0][t[1]]=t[2].replace(n," ").trim();return r[0]})(e);c[p]=d(s?{["@keyframes "+p]:t}:t,a?"":"."+p)}let f=a&&c.g?c.g:null;return a&&(c.g=c[p]),i=c[p],f?t.data=t.data.replace(f,i):-1===t.data.indexOf(i)&&(t.data=r?i+t.data:t.data+i),p})(s.unshift?s.raw?(t=[].slice.call(arguments,1),a=r.p,s.reduce((e,r,s)=>{let i=t[s];if(i&&i.call){let e=i(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+r+(null==i?"":i)},"")):s.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):s,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i})(r.target),r.g,r.o,r.k)}m.bind({g:1});let p,f,h,g=m.bind({k:1});function b(e,t){let a=this||{};return function(){let r=arguments;function s(i,o){let l=Object.assign({},i),n=l.className||s.className;a.p=Object.assign({theme:f&&f()},l),a.o=/ *go\d+/.test(n),l.className=m.apply(a,r)+(n?" "+n:""),t&&(l.ref=o);let d=e;return e[0]&&(d=l.as||e,delete l.as),h&&d[0]&&h(l),p(d,l)}return t?t(s):s}}var x=(e,t)=>"function"==typeof e?e(t):e,y=(t=0,()=>(++t).toString()),v=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},w="default",j=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(e=>e.id===s||void 0===s?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},k=[],N={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},C={},S=(e,t=w)=>{C[t]=j(C[t]||N,e),k.forEach(([e,a])=>{e===t&&a(C[t])})},E=e=>Object.keys(C).forEach(t=>S(e,t)),A=(e=w)=>t=>{S(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},z=(e={},t=w)=>{let[a,r]=(0,s.useState)(C[t]||N),i=(0,s.useRef)(C[t]);(0,s.useEffect)(()=>(i.current!==C[t]&&r(C[t]),k.push([t,r]),()=>{let e=k.findIndex(([e])=>e===t);e>-1&&k.splice(e,1)}),[t]);let o=a.toasts.map(t=>{var a,r,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||I[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...a,toasts:o}},D=e=>(t,a)=>{let r,s=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||y()}))(t,e,a);return A(s.toasterId||(r=s.id,Object.keys(C).find(e=>C[e].toasts.some(e=>e.id===r))))({type:2,toast:s}),s.id},$=(e,t)=>D("blank")(e,t);$.error=D("error"),$.success=D("success"),$.loading=D("loading"),$.custom=D("custom"),$.dismiss=(e,t)=>{let a={type:3,toastId:e};t?A(t)(a):E(a)},$.dismissAll=e=>$.dismiss(void 0,e),$.remove=(e,t)=>{let a={type:4,toastId:e};t?A(t)(a):E(a)},$.removeAll=e=>$.remove(void 0,e),$.promise=(e,t,a)=>{let r=$.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?x(t.success,e):void 0;return s?$.success(s,{id:r,...a,...null==a?void 0:a.success}):$.dismiss(r),e}).catch(e=>{let s=t.error?x(t.error,e):void 0;s?$.error(s,{id:r,...a,...null==a?void 0:a.error}):$.dismiss(r)}),e};var P=1e3,F=(e,t="default")=>{let{toasts:a,pausedAt:r}=z(e,t),i=(0,s.useRef)(new Map).current,o=(0,s.useCallback)((e,t=P)=>{if(i.has(e))return;let a=setTimeout(()=>{i.delete(e),l({type:4,toastId:e})},t);i.set(e,a)},[]);(0,s.useEffect)(()=>{if(r)return;let e=Date.now(),s=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(r<0){a.visible&&$.dismiss(a.id);return}return setTimeout(()=>$.dismiss(a.id,t),r)});return()=>{s.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let l=(0,s.useCallback)(A(t),[t]),n=(0,s.useCallback)(()=>{l({type:5,time:Date.now()})},[l]),d=(0,s.useCallback)((e,t)=>{l({type:1,toast:{id:e,height:t}})},[l]),c=(0,s.useCallback)(()=>{r&&l({type:6,time:Date.now()})},[r,l]),u=(0,s.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:s=8,defaultPosition:i}=t||{},o=a.filter(t=>(t.position||i)===(e.position||i)&&t.height),l=o.findIndex(t=>t.id===e.id),n=o.filter((e,t)=>t<l&&e.visible).length;return o.filter(e=>e.visible).slice(...r?[n+1]:[0,n]).reduce((e,t)=>e+(t.height||0)+s,0)},[a]);return(0,s.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[a,o]),{toasts:a,handlers:{updateHeight:d,startPause:n,endPause:c,calculateOffset:u}}},O=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,T=g`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,L=g`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,M=b("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${O} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${T} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,U=g`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,H=b("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${U} 1s linear infinite;
`,R=g`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,B=g`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,_=b("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${R} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${B} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,W=b("div")`
  position: absolute;
`,G=b("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,V=g`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Z=b("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${V} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,K=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?s.createElement(Z,null,t):t:"blank"===a?null:s.createElement(G,null,s.createElement(H,{...r}),"loading"!==a&&s.createElement(W,null,"error"===a?s.createElement(M,{...r}):s.createElement(_,{...r})))},Y=b("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,q=b("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,J=s.memo(({toast:e,position:t,style:a,children:r})=>{let i=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[r,s]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${g(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${g(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},o=s.createElement(K,{toast:e}),l=s.createElement(q,{...e.ariaProps},x(e.message,e));return s.createElement(Y,{className:e.className,style:{...i,...a,...e.style}},"function"==typeof r?r({icon:o,message:l}):s.createElement(s.Fragment,null,o,l))});r=s.createElement,d.p=void 0,p=r,f=void 0,h=void 0;var Q=({id:e,className:t,style:a,onHeightUpdate:r,children:i})=>{let o=s.useCallback(t=>{if(t){let a=()=>{r(e,t.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return s.createElement("div",{ref:o,className:t,style:a},i)},X=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;e.s(["CheckmarkIcon",0,_,"ErrorIcon",0,M,"LoaderIcon",0,H,"ToastBar",0,J,"ToastIcon",0,K,"Toaster",0,({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:i,toasterId:o,containerStyle:l,containerClassName:n})=>{let{toasts:d,handlers:c}=F(a,o);return s.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:n,onMouseEnter:c.startPause,onMouseLeave:c.endPause},d.map(a=>{let o,l,n=a.position||t,d=c.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}),u=(o=n.includes("top"),l=n.includes("center")?{justifyContent:"center"}:n.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:v()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${d*(o?1:-1)}px)`,...o?{top:0}:{bottom:0},...l});return s.createElement(Q,{id:a.id,key:a.id,onHeightUpdate:c.updateHeight,className:a.visible?X:"",style:u},"custom"===a.type?x(a.message,a):i?i(a):s.createElement(J,{toast:a,position:n}))}))},"default",0,$,"resolveValue",0,x,"toast",0,$,"useToaster",0,F,"useToasterStore",0,z],5766)},90464,e=>{"use strict";var t=e.i(43476),a=e.i(86770),r=e.i(87795),s=e.i(67430);e.i(51718);var i=e.i(38579),i=i;e.i(36180);var o=e.i(70607),l=e.i(71645);let n=(0,l.createContext)({user:null,loading:!0});e.s(["default",0,function({children:e}){let[d,c]=(0,l.useState)(null),[u,m]=(0,l.useState)(!0),p=(0,r.useAuthStore)(e=>e.setAuthDetails),f=(0,r.useAuthStore)(e=>e.clearAuthDetails),h=(0,s.default)(e=>e.fetchProfile);return(0,l.useEffect)(()=>{let e=(0,i.z)(a.auth,async e=>{c(e),e?(p({uid:e.uid,firebaseUid:e.uid,authEmail:e.email||"",authDisplayName:e.displayName||"",authPhotoUrl:e.photoURL||"",authEmailVerified:e.emailVerified,authReady:!0,authPending:!1,lastSignIn:(0,o.serverTimestamp)()}),await h()):f(),m(!1)});return()=>e()},[p,f,h]),(0,t.jsx)(n.Provider,{value:{user:d,loading:u},children:e})},"useFirebaseAuth",0,()=>(0,l.useContext)(n)],90464)},75254,e=>{"use strict";var t=e.i(71645);let a=(...e)=>e.filter((e,t,a)=>!!e&&""!==e.trim()&&a.indexOf(e)===t).join(" ").trim(),r=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,a)=>a?a.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let i=(0,t.createContext)({}),o=(0,t.forwardRef)(({color:e,size:r,strokeWidth:o,absoluteStrokeWidth:l,className:n="",children:d,iconNode:c,...u},m)=>{let{size:p=24,strokeWidth:f=2,absoluteStrokeWidth:h=!1,color:g="currentColor",className:b=""}=(0,t.useContext)(i)??{},x=l??h?24*Number(o??f)/Number(r??p):o??f;return(0,t.createElement)("svg",{ref:m,...s,width:r??p??s.width,height:r??p??s.height,stroke:e??g,strokeWidth:x,className:a("lucide",b,n),...!d&&!(e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1})(u)&&{"aria-hidden":"true"},...u},[...c.map(([e,a])=>(0,t.createElement)(e,a)),...Array.isArray(d)?d:[d]])});e.s(["default",0,(e,s)=>{let i=(0,t.forwardRef)(({className:i,...l},n)=>(0,t.createElement)(o,{ref:n,iconNode:s,className:a(`lucide-${r(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...l}));return i.displayName=r(e),i}],75254)},2971,e=>{"use strict";var t=e.i(43476),a=e.i(86770),r=e.i(87795),s=e.i(90464);e.i(51718);var i=e.i(38579),i=i,o=e.i(22016),l=e.i(71645),n=i,d=i,c=i,u=i,m=i,p=i,f=i,h=e.i(75254);let g=(0,h.default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var b=e.i(5766);function x({isOpen:e,onClose:r}){let[s,i]=(0,l.useState)("signin"),[o,h]=(0,l.useState)(""),[y,v]=(0,l.useState)(""),[w,j]=(0,l.useState)(!1),[k,N]=(0,l.useState)(!1);if((0,l.useEffect)(()=>{if((0,p.ae)(a.auth,window.location.href)){let e=window.localStorage.getItem("emailForSignIn");e||(e=window.prompt("Please provide your email for confirmation")||""),e&&(j(!0),(0,f.af)(a.auth,e,window.location.href).then(()=>{window.localStorage.removeItem("emailForSignIn"),b.default.success("Successfully signed in!"),window.history.replaceState(null,"",window.location.pathname)}).catch(e=>{console.error("Email link sign-in error:",e),b.default.error("Failed to sign in with email link")}).finally(()=>j(!1)))}},[]),!e)return null;let C=async()=>{j(!0);try{let e=new d.Y;await (0,n.d)(a.auth,e),b.default.success("Successfully signed in with Google!"),r()}catch(e){console.error("Google sign-in error:",e),b.default.error("Failed to sign in with Google")}finally{j(!1)}},S=async e=>{if(e.preventDefault(),!o||!y)return void b.default.error("Please enter email and password");j(!0);try{"signup"===s?(await (0,u.ab)(a.auth,o,y),b.default.success("Account created successfully!")):(await (0,c.ac)(a.auth,o,y),b.default.success("Successfully signed in!")),r()}catch(t){console.error("Email/password auth error:",t);let e=t instanceof Error?t.message:"Authentication failed";b.default.error(e.replace("Firebase: ","").replace(/\(auth\/.*\)/,"").trim())}finally{j(!1)}},E=async e=>{if(e.preventDefault(),!o)return void b.default.error("Please enter your email");j(!0);try{let e={url:window.location.origin,handleCodeInApp:!0};await (0,m.ad)(a.auth,o,e),window.localStorage.setItem("emailForSignIn",o),N(!0),b.default.success("Sign-in link sent to your email!")}catch(e){console.error("Email link error:",e),b.default.error("Failed to send sign-in link")}finally{j(!1)}};return(0,t.jsx)("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:(0,t.jsxs)("div",{className:"bg-white rounded-lg p-6 w-full max-w-md mx-4 relative",children:[(0,t.jsx)("button",{onClick:r,className:"absolute top-4 right-4 text-gray-500 hover:text-gray-700","aria-label":"Close",children:(0,t.jsx)(g,{size:24})}),(0,t.jsxs)("h2",{className:"text-2xl font-bold mb-6 text-center",children:["signin"===s&&"Sign In","signup"===s&&"Create Account","email-link"===s&&"Sign In with Email Link"]}),k?(0,t.jsxs)("div",{className:"text-center py-4",children:[(0,t.jsxs)("p",{className:"text-gray-600 mb-4",children:["We've sent a sign-in link to ",(0,t.jsx)("strong",{children:o})]}),(0,t.jsx)("p",{className:"text-sm text-gray-500",children:"Check your email and click the link to sign in."}),(0,t.jsx)("button",{onClick:()=>N(!1),className:"mt-4 text-blue-600 hover:underline",children:"Use a different email"})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("button",{onClick:C,disabled:w,className:"w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-4",children:[(0,t.jsxs)("svg",{className:"w-5 h-5",viewBox:"0 0 24 24",children:[(0,t.jsx)("path",{fill:"#4285F4",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"}),(0,t.jsx)("path",{fill:"#34A853",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),(0,t.jsx)("path",{fill:"#FBBC05",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"}),(0,t.jsx)("path",{fill:"#EA4335",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"})]}),"Continue with Google"]}),(0,t.jsxs)("div",{className:"relative my-4",children:[(0,t.jsx)("div",{className:"absolute inset-0 flex items-center",children:(0,t.jsx)("div",{className:"w-full border-t border-gray-300"})}),(0,t.jsx)("div",{className:"relative flex justify-center text-sm",children:(0,t.jsx)("span",{className:"bg-white px-2 text-gray-500",children:"or"})})]}),"email-link"===s?(0,t.jsxs)("form",{onSubmit:E,children:[(0,t.jsx)("input",{type:"email",value:o,onChange:e=>h(e.target.value),placeholder:"Email address",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:w}),(0,t.jsx)("button",{type:"submit",disabled:w,className:"w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:w?"Sending...":"Send Sign-In Link"})]}):(0,t.jsxs)("form",{onSubmit:S,children:[(0,t.jsx)("input",{type:"email",value:o,onChange:e=>h(e.target.value),placeholder:"Email address",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:w}),(0,t.jsx)("input",{type:"password",value:y,onChange:e=>v(e.target.value),placeholder:"Password",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:w}),(0,t.jsx)("button",{type:"submit",disabled:w,className:"w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:w?"Please wait...":"signup"===s?"Create Account":"Sign In"})]}),(0,t.jsxs)("div",{className:"mt-4 text-center text-sm",children:["signin"===s&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("button",{onClick:()=>i("signup"),className:"text-blue-600 hover:underline",children:"Create an account"}),(0,t.jsx)("span",{className:"mx-2 text-gray-400",children:"|"}),(0,t.jsx)("button",{onClick:()=>i("email-link"),className:"text-blue-600 hover:underline",children:"Sign in with email link"})]}),"signup"===s&&(0,t.jsx)("button",{onClick:()=>i("signin"),className:"text-blue-600 hover:underline",children:"Already have an account? Sign in"}),"email-link"===s&&(0,t.jsx)("button",{onClick:()=>i("signin"),className:"text-blue-600 hover:underline",children:"Sign in with password instead"})]})]})]})})}var y=e.i(57688);let v=(0,h.default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]),w=(0,h.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["default",0,function(){let{user:e,loading:n}=(0,s.useFirebaseAuth)(),d=(0,r.useAuthStore)(e=>e.authReady),c=(0,r.useAuthStore)(e=>e.authPhotoUrl),u=(0,r.useAuthStore)(e=>e.authDisplayName),[m,p]=(0,l.useState)(!1),[f,h]=(0,l.useState)(!1),g=async()=>{try{await (0,i.D)(a.auth),h(!1)}catch(e){console.error("Error signing out:",e)}};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"flex h-14 items-center justify-between px-4 py-2 bg-white border-b border-gray-200",children:[(0,t.jsx)(o.default,{href:"/",className:"font-medium text-xl",children:"RAG Demo"}),(0,t.jsxs)("nav",{className:"flex items-center gap-4",children:[(0,t.jsx)(o.default,{href:"/about",className:"text-gray-600 hover:text-gray-900",children:"About"}),n?(0,t.jsx)("div",{className:"w-8 h-8 bg-gray-200 rounded-full animate-pulse"}):e&&d?(0,t.jsxs)("div",{className:"flex gap-4 items-center",children:[(0,t.jsx)(o.default,{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"Dashboard"}),(0,t.jsx)(o.default,{href:"/profile",className:"text-gray-600 hover:text-gray-900",children:"Profile"}),(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)("button",{onClick:()=>h(!f),className:"flex items-center gap-2 focus:outline-none",children:c?(0,t.jsx)(y.default,{src:c,alt:u||"User",width:32,height:32,className:"rounded-full"}):(0,t.jsx)("div",{className:"w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium",children:u?.charAt(0).toUpperCase()||(0,t.jsx)(w,{size:16})})}),f&&(0,t.jsxs)("div",{className:"absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",children:[(0,t.jsxs)("div",{className:"px-4 py-2 border-b border-gray-100",children:[(0,t.jsx)("p",{className:"text-sm font-medium text-gray-900 truncate",children:u||"User"}),(0,t.jsx)("p",{className:"text-xs text-gray-500 truncate",children:e.email})]}),(0,t.jsxs)("button",{onClick:g,className:"w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",children:[(0,t.jsx)(v,{size:16}),"Sign out"]})]})]})]}):(0,t.jsx)("button",{onClick:()=>p(!0),className:"bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors",children:"Sign In"})]})]}),(0,t.jsx)(x,{isOpen:m,onClose:()=>p(!1)}),f&&(0,t.jsx)("div",{className:"fixed inset-0 z-40",onClick:()=>h(!1)})]})}],2971)}]);