module.exports=[18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},14747,(a,b,c)=>{b.exports=a.x("path",()=>require("path"))},24361,(a,b,c)=>{b.exports=a.x("util",()=>require("util"))},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},43285,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/dynamic-access-async-storage.external.js",()=>require("next/dist/server/app-render/dynamic-access-async-storage.external.js"))},42602,(a,b,c)=>{"use strict";b.exports=a.r(18622)},87924,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactJsxRuntime},72131,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].React},38783,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactServerDOMTurbopackClient},9270,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.AppRouterContext},35112,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactDOM},36313,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.HooksClientContext},18341,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.ServerInsertedHtml},6704,a=>{"use strict";let b,c;var d,e=a.i(72131);let f={data:""},g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,h=/\/\*[^]*?\*\/|  +/g,i=/\n+/g,j=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?j(g,f):f+"{"+j(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=j(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=j.p?j.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},k={},l=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+l(a[c]);return b}return a};function m(a){let b,c,d=this||{},e=a.call?a(d.p):a;return((a,b,c,d,e)=>{var f;let m=l(a),n=k[m]||(k[m]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(m));if(!k[n]){let b=m!==a?a:(a=>{let b,c,d=[{}];for(;b=g.exec(a.replace(h,""));)b[4]?d.shift():b[3]?(c=b[3].replace(i," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(i," ").trim();return d[0]})(a);k[n]=j(e?{["@keyframes "+n]:b}:b,c?"":"."+n)}let o=c&&k.g?k.g:null;return c&&(k.g=k[n]),f=k[n],o?b.data=b.data.replace(o,f):-1===b.data.indexOf(f)&&(b.data=d?f+b.data:b.data+f),n})(e.unshift?e.raw?(b=[].slice.call(arguments,1),c=d.p,e.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":j(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):e.reduce((a,b)=>Object.assign(a,b&&b.call?b(d.p):b),{}):e,d.target||f,d.g,d.o,d.k)}m.bind({g:1});let n,o,p,q=m.bind({k:1});function r(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:o&&o()},h),c.o=/ *go\d+/.test(i),h.className=m.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),p&&j[0]&&p(h),n(j,h)}return b?b(e):e}}var s=(a,b)=>"function"==typeof a?a(b):a,t=(b=0,()=>(++b).toString()),u="default",v=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return v(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},w=[],x={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},y={},z=(a,b=u)=>{y[b]=v(y[b]||x,a),w.forEach(([a,c])=>{a===b&&c(y[b])})},A=a=>Object.keys(y).forEach(b=>z(a,b)),B=(a=u)=>b=>{z(b,a)},C={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=(a={},b=u)=>{let[c,d]=(0,e.useState)(y[b]||x),f=(0,e.useRef)(y[b]);(0,e.useEffect)(()=>(f.current!==y[b]&&d(y[b]),w.push([b,d]),()=>{let a=w.findIndex(([a])=>a===b);a>-1&&w.splice(a,1)}),[b]);let g=c.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||C[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...c,toasts:g}},E=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||t()}))(b,a,c);return B(e.toasterId||(d=e.id,Object.keys(y).find(a=>y[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},F=(a,b)=>E("blank")(a,b);F.error=E("error"),F.success=E("success"),F.loading=E("loading"),F.custom=E("custom"),F.dismiss=(a,b)=>{let c={type:3,toastId:a};b?B(b)(c):A(c)},F.dismissAll=a=>F.dismiss(void 0,a),F.remove=(a,b)=>{let c={type:4,toastId:a};b?B(b)(c):A(c)},F.removeAll=a=>F.remove(void 0,a),F.promise=(a,b,c)=>{let d=F.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?s(b.success,a):void 0;return e?F.success(e,{id:d,...c,...null==c?void 0:c.success}):F.dismiss(d),a}).catch(a=>{let e=b.error?s(b.error,a):void 0;e?F.error(e,{id:d,...c,...null==c?void 0:c.error}):F.dismiss(d)}),a};var G=1e3,H=(a,b="default")=>{let{toasts:c,pausedAt:d}=D(a,b),f=(0,e.useRef)(new Map).current,g=(0,e.useCallback)((a,b=G)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,e.useEffect)(()=>{if(d)return;let a=Date.now(),e=c.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&F.dismiss(c.id);return}return setTimeout(()=>F.dismiss(c.id,b),d)});return()=>{e.forEach(a=>a&&clearTimeout(a))}},[c,d,b]);let h=(0,e.useCallback)(B(b),[b]),i=(0,e.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,e.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,e.useCallback)(()=>{d&&h({type:6,time:Date.now()})},[d,h]),l=(0,e.useCallback)((a,b)=>{let{reverseOrder:d=!1,gutter:e=8,defaultPosition:f}=b||{},g=c.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...d?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[c]);return(0,e.useEffect)(()=>{c.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[c,g]),{toasts:c,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}},I=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,J=q`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,K=q`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,L=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${J} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,M=q`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,N=r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${M} 1s linear infinite;
`,O=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,P=q`
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
}`,Q=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${O} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${P} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,R=r("div")`
  position: absolute;
`,S=r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,T=q`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${T} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,V=({toast:a})=>{let{icon:b,type:c,iconTheme:d}=a;return void 0!==b?"string"==typeof b?e.createElement(U,null,b):b:"blank"===c?null:e.createElement(S,null,e.createElement(N,{...d}),"loading"!==c&&e.createElement(R,null,"error"===c?e.createElement(L,{...d}):e.createElement(Q,{...d})))},W=r("div")`
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
`,X=r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Y=e.memo(({toast:a,position:b,style:d,children:f})=>{let g=a.height?((a,b)=>{let d=a.includes("top")?1:-1,[e,f]=c?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*d}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*d}%,-1px) scale(.6); opacity:0;}
`];return{animation:b?`${q(e)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${q(f)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||b||"top-center",a.visible):{opacity:0},h=e.createElement(V,{toast:a}),i=e.createElement(X,{...a.ariaProps},s(a.message,a));return e.createElement(W,{className:a.className,style:{...g,...d,...a.style}},"function"==typeof f?f({icon:h,message:i}):e.createElement(e.Fragment,null,h,i))});d=e.createElement,j.p=void 0,n=d,o=void 0,p=void 0;var Z=({id:a,className:b,style:c,onHeightUpdate:d,children:f})=>{let g=e.useCallback(b=>{if(b){let c=()=>{d(a,b.getBoundingClientRect().height)};c(),new MutationObserver(c).observe(b,{subtree:!0,childList:!0,characterData:!0})}},[a,d]);return e.createElement("div",{ref:g,className:b,style:c},f)},$=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;a.s(["CheckmarkIcon",0,Q,"ErrorIcon",0,L,"LoaderIcon",0,N,"ToastBar",0,Y,"ToastIcon",0,V,"Toaster",0,({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:f,children:g,toasterId:h,containerStyle:i,containerClassName:j})=>{let{toasts:k,handlers:l}=H(d,h);return e.createElement("div",{"data-rht-toaster":h||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:j,onMouseEnter:l.startPause,onMouseLeave:l.endPause},k.map(d=>{let h,i,j=d.position||b,k=l.calculateOffset(d,{reverseOrder:a,gutter:f,defaultPosition:b}),m=(h=j.includes("top"),i=j.includes("center")?{justifyContent:"center"}:j.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:c?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${k*(h?1:-1)}px)`,...h?{top:0}:{bottom:0},...i});return e.createElement(Z,{id:d.id,key:d.id,onHeightUpdate:l.updateHeight,className:d.visible?$:"",style:m},"custom"===d.type?s(d.message,d):g?g(d):e.createElement(Y,{toast:d,position:j}))}))},"default",0,F,"resolveValue",0,s,"toast",0,F,"useToaster",0,H,"useToasterStore",0,D],6704)},70106,a=>{"use strict";var b=a.i(72131);let c=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim(),d=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)};var e={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let f=(0,b.createContext)({}),g=(0,b.forwardRef)(({color:a,size:d,strokeWidth:g,absoluteStrokeWidth:h,className:i="",children:j,iconNode:k,...l},m)=>{let{size:n=24,strokeWidth:o=2,absoluteStrokeWidth:p=!1,color:q="currentColor",className:r=""}=(0,b.useContext)(f)??{},s=h??p?24*Number(g??o)/Number(d??n):g??o;return(0,b.createElement)("svg",{ref:m,...e,width:d??n??e.width,height:d??n??e.height,stroke:a??q,strokeWidth:s,className:c("lucide",r,i),...!j&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0;return!1})(l)&&{"aria-hidden":"true"},...l},[...k.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(j)?j:[j]])});a.s(["default",0,(a,e)=>{let f=(0,b.forwardRef)(({className:f,...h},i)=>(0,b.createElement)(g,{ref:i,iconNode:e,className:c(`lucide-${d(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,f),...h}));return f.displayName=d(a),f}],70106)},33354,(a,b,c)=>{"use strict";c._=function(a){return a&&a.__esModule?a:{default:a}}},46058,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},88347,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d,e,f={ACTION_HMR_REFRESH:function(){return l},ACTION_NAVIGATE:function(){return i},ACTION_REFRESH:function(){return h},ACTION_RESTORE:function(){return j},ACTION_SERVER_ACTION:function(){return m},ACTION_SERVER_PATCH:function(){return k},PrefetchKind:function(){return n},ScrollBehavior:function(){return o}};for(var g in f)Object.defineProperty(c,g,{enumerable:!0,get:f[g]});let h="refresh",i="navigate",j="restore",k="server-patch",l="hmr-refresh",m="server-action";var n=((d={}).AUTO="auto",d.FULL="full",d),o=((e={})[e.Default=0]="Default",e[e.NoScroll=1]="NoScroll",e);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},67009,(a,b,c)=>{"use strict";function d(a){return null!==a&&"object"==typeof a&&"then"in a&&"function"==typeof a.then}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isThenable",{enumerable:!0,get:function(){return d}})},90841,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={dispatchAppRouterAction:function(){return i},dispatchGestureState:function(){return j},refreshOnInstantNavigationUnlock:function(){return h},useActionQueue:function(){return k}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(46058)._(a.r(72131)),g=a.r(67009);a.r(88347);function h(){}function i(a){!0;throw Object.defineProperty(Error("Internal Next.js error: Router action dispatched before initialization."),"__NEXT_ERROR_CODE",{value:"E668",enumerable:!1,configurable:!0})}function j(a){!0;throw Object.defineProperty(Error("Internal Next.js error: Router action dispatched before initialization."),"__NEXT_ERROR_CODE",{value:"E668",enumerable:!1,configurable:!0})}function k(a){let[b,c]=f.default.useState(a.state),[d,e]=(0,f.useOptimistic)(b),h=(0,f.useMemo)(()=>d,[d]);return(0,g.isThenable)(h)?(0,f.use)(h):h}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},20611,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"callServer",{enumerable:!0,get:function(){return g}});let d=a.r(72131),e=a.r(88347),f=a.r(90841);async function g(a,b){return new Promise((c,g)=>{(0,d.startTransition)(()=>{(0,f.dispatchAppRouterAction)({type:e.ACTION_SERVER_ACTION,actionId:a,actionArgs:b,resolve:c,reject:g})})})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},1722,(a,b,c)=>{"use strict";let d;Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"findSourceMapURL",{enumerable:!0,get:function(){return d}});("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},46786,(a,b,c)=>{b.exports=a.x("os",()=>require("os"))},22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},54799,(a,b,c)=>{b.exports=a.x("crypto",()=>require("crypto"))},27699,(a,b,c)=>{b.exports=a.x("events",()=>require("events"))},21517,(a,b,c)=>{b.exports=a.x("http",()=>require("http"))},50513,a=>{"use strict";var b=a.i(20226);a.i(69387);var c=a.i(7228),d=a.i(1787),e=a.i(62964),e=e,f=a.i(78102),g=a.i(88785);let h={email:"",contactEmail:"",displayName:"",photoUrl:"",emailVerified:!1,credits:0},i=(0,b.create)((a,b)=>({profile:h,fetchProfile:async()=>{let{uid:b,authEmail:e,authDisplayName:i,authPhotoUrl:j,authEmailVerified:k}=f.useAuthStore.getState();if(b)try{let f,l=(0,c.doc)(g.db,`users/${b}/profile/userData`),m=await (0,d.getDoc)(l);if(m.exists()){let a,b;a=m.data(),b={authEmail:e,authDisplayName:i,authPhotoUrl:j,authEmailVerified:k},f={...h,...a,credits:a.credits&&a.credits>=100?a.credits:1e3,email:b.authEmail||a.email||"",contactEmail:a.contactEmail||b.authEmail||"",displayName:a.displayName||b.authDisplayName||"",photoUrl:a.photoUrl||b.authPhotoUrl||""}}else f={email:e||"",contactEmail:"",displayName:i||"",photoUrl:j||"",emailVerified:k||!1,credits:1e3},await (0,d.setDoc)(l,f);a({profile:f})}catch(a){console.error("Error fetching or creating profile:",a)}},updateProfile:async e=>{let h=f.useAuthStore.getState().uid;if(h)try{let f=(0,c.doc)(g.db,`users/${h}/profile/userData`),i={...b().profile,...e};await (0,d.updateDoc)(f,i),a({profile:i})}catch(a){throw console.error("Error updating profile:",a),a}},useCredits:async h=>{let i=f.useAuthStore.getState().uid;if(!i)return!1;try{let f=(0,c.doc)(g.db,`users/${i}/profile/userData`),j=await (0,d.runTransaction)(g.db,async a=>{let b=await a.get(f);if(!b.exists())throw Error("Profile not found");return!((b.data().credits||0)<h)&&(a.update(f,{credits:(0,e.b5)(-h)}),!0)});if(j){let c=b().profile;a({profile:{...c,credits:c.credits-h}})}return j}catch(a){return console.error("Error using credits:",a),!1}},addCredits:async h=>{let i=f.useAuthStore.getState().uid;if(i)try{let f=(0,c.doc)(g.db,`users/${i}/profile/userData`);await (0,d.updateDoc)(f,{credits:(0,e.b5)(h)});let j=await (0,d.getDoc)(f);if(j.exists()){let c=j.data();a({profile:{...b().profile,credits:c.credits||0}})}}catch(a){throw console.error("Error adding credits:",a),a}}}));a.s(["default",0,i],50513)},10998,a=>{"use strict";var b=a.i(87924),c=a.i(88785),d=a.i(78102),e=a.i(50513);a.i(30485);var f=a.i(55113),f=f;a.i(69387);var g=a.i(57735),h=a.i(72131);let i=(0,h.createContext)({user:null,loading:!0});a.s(["default",0,function({children:a}){let[j,k]=(0,h.useState)(null),[l,m]=(0,h.useState)(!0),n=(0,d.useAuthStore)(a=>a.setAuthDetails),o=(0,d.useAuthStore)(a=>a.clearAuthDetails),p=(0,e.default)(a=>a.fetchProfile);return(0,h.useEffect)(()=>{let a=(0,f.z)(c.auth,async a=>{k(a),a?(n({uid:a.uid,firebaseUid:a.uid,authEmail:a.email||"",authDisplayName:a.displayName||"",authPhotoUrl:a.photoURL||"",authEmailVerified:a.emailVerified,authReady:!0,authPending:!1,lastSignIn:(0,g.serverTimestamp)()}),await p()):o(),m(!1)});return()=>a()},[n,o,p]),(0,b.jsx)(i.Provider,{value:{user:j,loading:l},children:a})},"useFirebaseAuth",0,()=>(0,h.useContext)(i)],10998)},20238,a=>{"use strict";var b=a.i(87924),c=a.i(88785),d=a.i(78102),e=a.i(10998);a.i(30485);var f=a.i(55113),f=f,g=a.i(38246),h=a.i(72131),i=f,j=f,k=f,l=f,m=f,n=f,o=f,p=a.i(70106);let q=(0,p.default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var r=a.i(6704);function s({isOpen:a,onClose:d}){let[e,f]=(0,h.useState)("signin"),[g,p]=(0,h.useState)(""),[t,u]=(0,h.useState)(""),[v,w]=(0,h.useState)(!1),[x,y]=(0,h.useState)(!1);if((0,h.useEffect)(()=>{if((0,n.ae)(c.auth,window.location.href)){let a=window.localStorage.getItem("emailForSignIn");a||(a=window.prompt("Please provide your email for confirmation")||""),a&&(w(!0),(0,o.af)(c.auth,a,window.location.href).then(()=>{window.localStorage.removeItem("emailForSignIn"),r.default.success("Successfully signed in!"),window.history.replaceState(null,"",window.location.pathname)}).catch(a=>{console.error("Email link sign-in error:",a),r.default.error("Failed to sign in with email link")}).finally(()=>w(!1)))}},[]),!a)return null;let z=async()=>{w(!0);try{let a=new j.Y;await (0,i.d)(c.auth,a),r.default.success("Successfully signed in with Google!"),d()}catch(a){console.error("Google sign-in error:",a),r.default.error("Failed to sign in with Google")}finally{w(!1)}},A=async a=>{if(a.preventDefault(),!g||!t)return void r.default.error("Please enter email and password");w(!0);try{"signup"===e?(await (0,l.ab)(c.auth,g,t),r.default.success("Account created successfully!")):(await (0,k.ac)(c.auth,g,t),r.default.success("Successfully signed in!")),d()}catch(b){console.error("Email/password auth error:",b);let a=b instanceof Error?b.message:"Authentication failed";r.default.error(a.replace("Firebase: ","").replace(/\(auth\/.*\)/,"").trim())}finally{w(!1)}},B=async a=>{if(a.preventDefault(),!g)return void r.default.error("Please enter your email");w(!0);try{let a={url:window.location.origin,handleCodeInApp:!0};await (0,m.ad)(c.auth,g,a),window.localStorage.setItem("emailForSignIn",g),y(!0),r.default.success("Sign-in link sent to your email!")}catch(a){console.error("Email link error:",a),r.default.error("Failed to send sign-in link")}finally{w(!1)}};return(0,b.jsx)("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50",children:(0,b.jsxs)("div",{className:"bg-white rounded-lg p-6 w-full max-w-md mx-4 relative",children:[(0,b.jsx)("button",{onClick:d,className:"absolute top-4 right-4 text-gray-500 hover:text-gray-700","aria-label":"Close",children:(0,b.jsx)(q,{size:24})}),(0,b.jsxs)("h2",{className:"text-2xl font-bold mb-6 text-center",children:["signin"===e&&"Sign In","signup"===e&&"Create Account","email-link"===e&&"Sign In with Email Link"]}),x?(0,b.jsxs)("div",{className:"text-center py-4",children:[(0,b.jsxs)("p",{className:"text-gray-600 mb-4",children:["We've sent a sign-in link to ",(0,b.jsx)("strong",{children:g})]}),(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"Check your email and click the link to sign in."}),(0,b.jsx)("button",{onClick:()=>y(!1),className:"mt-4 text-blue-600 hover:underline",children:"Use a different email"})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("button",{onClick:z,disabled:v,className:"w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed mb-4",children:[(0,b.jsxs)("svg",{className:"w-5 h-5",viewBox:"0 0 24 24",children:[(0,b.jsx)("path",{fill:"#4285F4",d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"}),(0,b.jsx)("path",{fill:"#34A853",d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"}),(0,b.jsx)("path",{fill:"#FBBC05",d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"}),(0,b.jsx)("path",{fill:"#EA4335",d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"})]}),"Continue with Google"]}),(0,b.jsxs)("div",{className:"relative my-4",children:[(0,b.jsx)("div",{className:"absolute inset-0 flex items-center",children:(0,b.jsx)("div",{className:"w-full border-t border-gray-300"})}),(0,b.jsx)("div",{className:"relative flex justify-center text-sm",children:(0,b.jsx)("span",{className:"bg-white px-2 text-gray-500",children:"or"})})]}),"email-link"===e?(0,b.jsxs)("form",{onSubmit:B,children:[(0,b.jsx)("input",{type:"email",value:g,onChange:a=>p(a.target.value),placeholder:"Email address",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:v}),(0,b.jsx)("button",{type:"submit",disabled:v,className:"w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:v?"Sending...":"Send Sign-In Link"})]}):(0,b.jsxs)("form",{onSubmit:A,children:[(0,b.jsx)("input",{type:"email",value:g,onChange:a=>p(a.target.value),placeholder:"Email address",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:v}),(0,b.jsx)("input",{type:"password",value:t,onChange:a=>u(a.target.value),placeholder:"Password",className:"w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500",disabled:v}),(0,b.jsx)("button",{type:"submit",disabled:v,className:"w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",children:v?"Please wait...":"signup"===e?"Create Account":"Sign In"})]}),(0,b.jsxs)("div",{className:"mt-4 text-center text-sm",children:["signin"===e&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{onClick:()=>f("signup"),className:"text-blue-600 hover:underline",children:"Create an account"}),(0,b.jsx)("span",{className:"mx-2 text-gray-400",children:"|"}),(0,b.jsx)("button",{onClick:()=>f("email-link"),className:"text-blue-600 hover:underline",children:"Sign in with email link"})]}),"signup"===e&&(0,b.jsx)("button",{onClick:()=>f("signin"),className:"text-blue-600 hover:underline",children:"Already have an account? Sign in"}),"email-link"===e&&(0,b.jsx)("button",{onClick:()=>f("signin"),className:"text-blue-600 hover:underline",children:"Sign in with password instead"})]})]})]})})}var t=a.i(71987);let u=(0,p.default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]),v=(0,p.default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);a.s(["default",0,function(){let{user:a,loading:i}=(0,e.useFirebaseAuth)(),j=(0,d.useAuthStore)(a=>a.authReady),k=(0,d.useAuthStore)(a=>a.authPhotoUrl),l=(0,d.useAuthStore)(a=>a.authDisplayName),[m,n]=(0,h.useState)(!1),[o,p]=(0,h.useState)(!1),q=async()=>{try{await (0,f.D)(c.auth),p(!1)}catch(a){console.error("Error signing out:",a)}};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("div",{className:"flex h-14 items-center justify-between px-4 py-2 bg-white border-b border-gray-200",children:[(0,b.jsx)(g.default,{href:"/",className:"font-medium text-xl",children:"RAG Demo"}),(0,b.jsxs)("nav",{className:"flex items-center gap-4",children:[(0,b.jsx)(g.default,{href:"/about",className:"text-gray-600 hover:text-gray-900",children:"About"}),i?(0,b.jsx)("div",{className:"w-8 h-8 bg-gray-200 rounded-full animate-pulse"}):a&&j?(0,b.jsxs)("div",{className:"flex gap-4 items-center",children:[(0,b.jsx)(g.default,{href:"/dashboard",className:"text-gray-600 hover:text-gray-900",children:"Dashboard"}),(0,b.jsx)(g.default,{href:"/profile",className:"text-gray-600 hover:text-gray-900",children:"Profile"}),(0,b.jsxs)("div",{className:"relative",children:[(0,b.jsx)("button",{onClick:()=>p(!o),className:"flex items-center gap-2 focus:outline-none",children:k?(0,b.jsx)(t.default,{src:k,alt:l||"User",width:32,height:32,className:"rounded-full"}):(0,b.jsx)("div",{className:"w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium",children:l?.charAt(0).toUpperCase()||(0,b.jsx)(v,{size:16})})}),o&&(0,b.jsxs)("div",{className:"absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",children:[(0,b.jsxs)("div",{className:"px-4 py-2 border-b border-gray-100",children:[(0,b.jsx)("p",{className:"text-sm font-medium text-gray-900 truncate",children:l||"User"}),(0,b.jsx)("p",{className:"text-xs text-gray-500 truncate",children:a.email})]}),(0,b.jsxs)("button",{onClick:q,className:"w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",children:[(0,b.jsx)(u,{size:16}),"Sign out"]})]})]})]}):(0,b.jsx)("button",{onClick:()=>n(!0),className:"bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors",children:"Sign In"})]})]}),(0,b.jsx)(s,{isOpen:m,onClose:()=>n(!1)}),o&&(0,b.jsx)("div",{className:"fixed inset-0 z-40",onClick:()=>p(!1)})]})}],20238)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0~m5c~w._.js.map