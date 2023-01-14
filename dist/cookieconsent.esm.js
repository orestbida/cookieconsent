/*!
* CookieConsent 3.0.0-rc.11
* https://github.com/orestbida/cookieconsent
* Author Orest Bida
* Released under the MIT License
*/
const e='button';class t{constructor(){this.t={mode:'opt-in',revision:0,autoShow:!0,autoClearCookies:!0,manageScriptTags:!0,hideFromBots:!0,lazyHtmlGeneration:!0,cookie:{name:'cc_cookie',expiresAfterDays:182,domain:'',path:'/',sameSite:'Lax'}},this.o={i:{},l:'',_:{},u:{},p:{},m:[],g:!1,v:null,h:null,C:null,S:'',k:!0,M:!1,T:!1,D:!1,A:!1,N:!1,H:!1,I:!1,V:!1,P:[],F:!1,O:!0,j:[],R:!1,B:'',G:!1,J:[],L:[],U:[],$:[],q:!1,K:!1,W:!1,X:[],Y:[],Z:[],ee:{},te:{},oe:{},ne:{},ae:{},ce:[],se:[]},this.ie={re:{},le:{}},this.de={},this.fe={_e:'cc:onFirstConsent',ue:'cc:onConsent',pe:'cc:onChange',me:'cc:onModalShow',ge:'cc:onModalHide',ve:'cc:onModalReady'}}}const o=new t,n=(e,t)=>e.indexOf(t),a=(e,t)=>-1!==n(e,t),c=e=>Array.isArray(e),s=e=>'string'==typeof e,i=e=>!!e&&'object'==typeof e&&!c(e),r=e=>'function'==typeof e,l=e=>Object.keys(e),d=e=>Array.from(new Set(e)),f=()=>document.activeElement,_=e=>e.preventDefault(),u=(e,t)=>e.querySelectorAll(t),p=e=>e.dispatchEvent(new Event('change')),m=t=>{const o=document.createElement(t);return t===e&&(o.type=t),o},g=(e,t,o)=>e.setAttribute(t,o),v=(e,t,o)=>{e.removeAttribute(o?'data-'+t:t)},b=(e,t,o)=>e.getAttribute(o?'data-'+t:t),h=(e,t)=>e.appendChild(t),y=(e,t)=>e.classList.add(t),w=(e,t)=>y(e,'cm__'+t),C=(e,t)=>y(e,'pm__'+t),S=(e,t)=>e.classList.remove(t),k=e=>{if('object'!=typeof e)return e;if(e instanceof Date)return new Date(e.getTime());let t=Array.isArray(e)?[]:{};for(let o in e){let n=e[o];t[o]=k(n)}return t},M=()=>{const e={},{J:t,ee:n,te:a}=o.o;for(const o of t)e[o]=E(a[o],l(n[o]));return e},T=(e,t)=>dispatchEvent(new CustomEvent(e,{detail:t})),x=(e,t,n,a)=>{e.addEventListener(t,n),a&&o.o.m.push({be:e,he:t,ye:n})},D=()=>{const e=o.t.cookie.expiresAfterDays;return r(e)?e(o.o.B):e},E=(e,t)=>{const o=e||[],n=t||[];return o.filter((e=>!a(n,e))).concat(n.filter((e=>!a(o,e))))},A=e=>{o.o.L=d(e),o.o.B=(()=>{let e='custom';const{L:t,J:n,U:a}=o.o,c=t.length;return c===n.length?e='all':c===a.length&&(e='necessary'),e})()},N=(e,t,n,a)=>{const{show:c,showPreferences:s,hide:i,hidePreferences:r,acceptCategory:l}=t,d=e||document,f=e=>u(d,`[data-cc="${e}"]`),p=(e,t)=>{_(e),l(t),r(),i()},m=f('show-preferencesModal'),v=f('show-consentModal'),b=f('accept-all'),h=f('accept-necessary'),y=f('accept-custom'),w=o.t.lazyHtmlGeneration;for(const e of m)g(e,'aria-haspopup','dialog'),x(e,'click',(e=>{_(e),s()})),w&&x(e,'mouseenter',(e=>{_(e),o.o.A||n(t,a)}),!0);for(let e of v)g(e,'aria-haspopup','dialog'),x(e,'click',(e=>{_(e),c(!0)}),!0);for(let e of b)x(e,'click',(e=>{p(e,'all')}),!0);for(let e of y)x(e,'click',(e=>{p(e)}),!0);for(let e of h)x(e,'click',(e=>{p(e,[])}),!0)};let H;const I=e=>{clearTimeout(H),e?y(o.ie.we,'disable--interaction'):H=setTimeout((()=>{S(o.ie.we,'disable--interaction')}),500)},V=()=>{const{o:t,ie:n}=o,a=['[href]',e,'input','details','[tabindex="0"]'].join(':not([tabindex="-1"]), '),c=(e,t)=>{const o=u(e,a);t[0]=o[0],t[1]=o[o.length-1]};t.M&&c(n.Ce,t.X),t.A&&c(n.Se,t.Y),t.I=!1,t.H=!1},P=(e,t,n)=>{const{pe:a,ue:c,_e:s,ge:i,ve:l,me:d}=o.de,f=o.fe,_={cookie:o.o.p};if(t){const o={modalName:t};return e===f.me?r(d)&&d(o):e===f.ge?r(i)&&i(o):(o.modal=n,r(l)&&l(o)),T(e,o)}e===f._e?r(s)&&s(k(_)):e===f.ue?r(c)&&c(k(_)):(_.changedCategories=o.o.j,_.changedServices=o.o.ne,r(a)&&a(k(_))),T(e,k(_))},F=e=>{const{te:t,ne:n,J:c,ee:s,ce:i,se:l,p:d,j:f}=o.o;for(const e of c){const o=n[e]||t[e]||[];for(const n of o){const o=s[e][n],{onAccept:c,onReject:i}=o;o&&(!o.ke&&a(t[e],n)&&r(c)?(o.ke=!0,c()):o.ke&&!a(t[e],n)&&r(i)&&(o.ke=!1,i()))}}if(!o.t.manageScriptTags)return;const _=i,u=e||d.categories||[],p=(e,o)=>{if(o<e.length){const c=e[o],s=l[o],i=s.Me,r=s.Te,d=a(u,i),_=!!r&&a(t[i],r);if(!s.xe){let t=!r&&!s.De&&d,l=r&&!s.De&&_,u=!r&&s.De&&!d&&a(f,i),h=r&&s.De&&!_&&a(n[i]||[],r);if(t||u||l||h){s.xe=!0;const t=b(c,'type',!0);v(c,'type',!!t),v(c,'data-category');let n=b(c,'src',!0);n&&v(c,'src',!0);const a=m('script');a.textContent=c.innerHTML;for(const{nodeName:e}of c.attributes)g(a,e,c[e]||b(c,e));if(t&&(a.type=t),n?a.src=n:n=c.src,n&&(a.onload=a.onerror=()=>{p(e,++o)}),c.replaceWith(a),n)return}}p(e,++o)}};p(_,0)},O=['middle','top','bottom'],j=['left','center','right'],R={box:{Ee:['wide','inline'],Ae:O,Ne:j,He:'bottom',Ie:'right'},cloud:{Ee:['inline'],Ae:O,Ne:j,He:'bottom',Ie:'center'},bar:{Ee:['inline'],Ae:O.slice(1),Ne:[],He:'bottom',Ie:''}},B={box:{Ee:[],Ae:[],Ne:[],He:'',Ie:''},bar:{Ee:['wide'],Ae:[],Ne:['left','right'],He:'',Ie:'left'}},G=e=>{const t=o.o.i.guiOptions,n=t?.consentModal,a=t?.preferencesModal;0===e&&J(o.ie.Ce,R,n,'cm--','box','cm'),1===e&&J(o.ie.Se,B,a,'pm--','box','pm')},J=(e,t,n,c,s,i)=>{e.className=i;const r=n?.layout,l=n?.position,d=n?.flipButtons,f=!1!==n?.equalWeightButtons,_=r?.split(' ')||[],u=_[0],p=_[1],m=u in t?u:s,g=t[m],v=a(g.Ee,p)&&p,b=l?.split(' ')||[],h=b[0],w='pm--'===c?b[0]:b[1],C=a(g.Ae,h)?h:g.He,k=a(g.Ne,w)?w:g.Ie,M=t=>y(e,c+t);M(m),M(v),M(C),M(k),d&&M('flip');const T=i+'__btn--secondary';if('cm'===i){const{Ve:e,Pe:t}=o.ie;e&&(f?S(e,T):y(e,T)),t&&(f?S(t,T):y(t,T))}else{const{Fe:e}=o.ie;e&&(f?S(e,T):y(e,T))}},L=(t,n)=>{const a=o.o,c=o.ie,{hide:r,hidePreferences:d,acceptCategory:f}=t,_=e=>{f(e),d(),r()},u=a.u&&a.u.preferencesModal;if(!u)return;const p=u.title,v=u.closeIconLabel,b=u.acceptAllBtn,w=u.acceptNecessaryBtn,k=u.savePreferencesBtn,M=u.sections,T=b||w||k;if(c.Oe)c.je=m('div'),C(c.je,'body');else{c.Oe=m('div'),y(c.Oe,'pm-wrapper'),c.Se=m('div'),c.Se.style.visibility='hidden',y(c.Se,'pm'),g(c.Se,'role','dialog'),g(c.Se,'aria-hidden',!0),g(c.Se,'aria-modal',!0),g(c.Se,'aria-labelledby','pm__title'),x(c.we,'keydown',(e=>{27===e.keyCode&&d()}),!0),c.Re=m('div'),C(c.Re,'header'),c.Be=m('div'),C(c.Be,'title'),c.Be.id='pm__title',g(c.Be,'role','heading'),g(c.Be,'aria-level','2'),c.Ge=m(e),C(c.Ge,'close-btn'),g(c.Ge,'aria-label',u.closeIconLabel||''),x(c.Ge,'click',d),c.Je=m('div'),C(c.Je,'body'),c.Le=m('div'),C(c.Le,'footer');var D=m('div');y(D,'btns');var E=m('div'),A=m('div');C(E,'btn-group'),C(A,'btn-group'),h(c.Le,E),h(c.Le,A),h(c.Re,c.Be),h(c.Re,c.Ge),h(c.Se,c.Re),h(c.Se,c.Je),T&&h(c.Se,c.Le),h(c.Oe,c.Se)}let N;p&&(c.Be.innerHTML=p,v&&g(c.Ge,'aria-label',v)),M&&M.forEach((t=>{const o=t.title,n=t.description,r=t.linkedCategory,d=r&&a.G[r],f=t.cookieTable,_=f?.body,p=_?.length>0,v=!!d,b=v&&a.ee[r],w=i(b)&&l(b)||[],k=v&&(!!n||!!p||l(b).length>0);var M=m('div');if(C(M,'section'),k||n){var T=m('div');C(T,'section-desc-wrapper')}let D=w.length;if(k&&D>0){const e=m('div');C(e,'section-services');for(const t of w){const o=b[t]?.label||t,n=m('div'),a=m('div'),c=m('div'),s=m('div');C(n,'service'),C(s,'service-title'),C(a,'service-header'),C(c,'service-icon');const i=U(o,t,d,!0,r);s.innerHTML=o,h(a,c),h(a,s),h(n,a),h(n,i),h(e,n)}h(T,e)}if(o){var E=m('div'),A=m(v?e:'div');if(C(E,'section-title-wrapper'),C(A,'section-title'),A.innerHTML=o,h(E,A),v){const e=m('span');C(e,'section-arrow'),h(E,e),M.className+='--toggle';const t=U(o,r,d);let n=u.serviceCounterLabel;if(D>0&&s(n)){let e=m('span');C(e,'badge'),C(e,'service-counter'),g(e,'aria-hidden',!0),g(e,'data-servicecounter',D),n&&(n=n.split('|'),n=n.length>1&&D>1?n[1]:n[0],g(e,'data-counterlabel',n)),e.innerHTML=D+(n?' '+n:''),h(A,e)}if(k){C(M,'section--expandable');var H=r+'-desc';g(A,'aria-expanded',!1),g(A,'aria-controls',H)}h(E,t)}else g(A,'role','heading'),g(A,'aria-level','3');h(M,E)}if(n){var I=m('div');C(I,'section-desc'),I.innerHTML=n,h(T,I)}if(k&&(g(T,'aria-hidden','true'),T.id=H,((e,t,o)=>{x(A,'click',(()=>{t.classList.contains('is-expanded')?(S(t,'is-expanded'),g(o,'aria-expanded','false'),g(e,'aria-hidden','true')):(y(t,'is-expanded'),g(o,'aria-expanded','true'),g(e,'aria-hidden','false'))}))})(T,M,A),p)){const e=m('table'),t=m('thead'),o=m('tbody');C(e,'section-table'),C(t,'table-head'),C(o,'table-body');const n=f.headers,a=l(n),s=c.Ue.createDocumentFragment(),i=m('tr');g(i,'role','row');for(const e of a){const t=n[e],o=m('th');o.id='cc__row-'+t,g(o,'role','columnheader'),g(o,'scope','col'),C(o,'table-th'),o.innerHTML=t,h(s,o)}h(i,s),h(t,i);const r=c.Ue.createDocumentFragment();for(const e of _){const t=m('tr');g(t,'role','row'),C(t,'table-tr');for(const o of a){const a=n[o],c=e[o],s=m('td'),i=m('div');C(s,'table-td'),g(s,'data-column',a),g(s,'headers','cc__row-'+a),i.insertAdjacentHTML('beforeend',c),h(s,i),h(t,s)}h(r,t)}h(o,r),h(e,t),h(e,o),h(T,e)}(k||n)&&h(M,T);const V=c.je||c.Je;v?(N||(N=m('div'),C(N,'section-toggles')),N.appendChild(M)):N=null,h(V,N||M)})),(b||w)&&(w&&(c.Fe||(c.Fe=m(e),C(c.Fe,'btn'),g(c.Fe,'data-role','necessary'),h(E,c.Fe),x(c.Fe,'click',(()=>_([])))),c.Fe.innerHTML=w),b&&(c.ze||(c.ze=m(e),C(c.ze,'btn'),g(c.ze,'data-role','all'),h(E,c.ze),x(c.ze,'click',(()=>_('all')))),c.ze.innerHTML=b)),k&&(c.$e||(c.$e=m(e),C(c.$e,'btn'),C(c.$e,'btn--secondary'),g(c.$e,'data-role','save'),h(A,c.$e),x(c.$e,'click',(()=>_()))),c.$e.innerHTML=k),c.je&&(c.Se.replaceChild(c.je,c.Je),c.Je=c.je),G(1),a.A||(a.A=!0,P(o.fe.ve,'preferencesModal',c.Se),n(t),setTimeout(V,10),h(c.qe,c.Oe),setTimeout((()=>y(c.Oe,'cc--anim')),100))};function U(e,t,n,c,s){const i=o.o,r=o.ie,l=m('label'),d=m('input'),f=m('span'),_=m('span'),u=m('span'),p=m('span');if(d.type='checkbox',y(l,'section__toggle-wrapper'),y(d,'section__toggle'),y(u,'toggle__icon-on'),y(p,'toggle__icon-off'),y(f,'toggle__icon'),y(_,'toggle__label'),g(f,'aria-hidden','true'),c?(y(l,'toggle-service'),g(d,'data-category',s),r.le[s][t]=d):r.re[t]=d,c?(e=>{x(d,'change',(()=>{const t=r.le[e],o=r.re[e];i.oe[e]=[];for(let o in t){const n=t[o];n.checked&&i.oe[e].push(n.value)}o.checked=i.oe[e].length>0}))})(s):(e=>{x(d,'click',(()=>{const t=r.le[e];i.oe[e]=[];for(let e in t)t[e].checked=d.checked}))})(t),d.value=t,_.textContent=e.replace(/<.*>.*<\/.*>/gm,''),h(f,p),h(f,u),i.k)(n.readOnly||'opt-out'===i.i.mode&&n.enabled)&&(d.checked=!0);else if(c){const e=i.te[s];d.checked=n.readOnly||a(e,t)}else a(i.L,t)&&(d.checked=!0);return n.readOnly&&(d.disabled=!0),h(l,d),h(l,f),h(l,_),l}const z=(t,n)=>{const a=o.o,c=o.ie,{hide:s,showPreferences:i,acceptCategory:r}=t,l=a.u&&a.u.consentModal;if(!l)return;const d=l.acceptAllBtn,f=l.acceptNecessaryBtn,_=l.showPreferencesBtn,u=l.closeIconLabel,p=l.footer,v=l.label,b=l.title,C=e=>{s(),r(e)};if(!c.Ke){c.Ke=m('div'),c.Ce=m('div'),c.Qe=m('div'),c.We=m('div'),c.Xe=m('div'),y(c.Ke,'cm-wrapper'),y(c.Ce,'cm'),w(c.Qe,'body'),w(c.We,'texts'),w(c.Xe,'btns'),g(c.Ce,'role','dialog'),g(c.Ce,'aria-modal','true'),g(c.Ce,'aria-hidden','false'),g(c.Ce,'aria-describedby','cm__desc'),v?g(c.Ce,'aria-label',v):b&&g(c.Ce,'aria-labelledby','cm__title'),c.Ce.style.visibility='hidden';const t='box',o=a.i.guiOptions?.consentModal,n=(o?.layout||t).split(' ')[0]===t;b&&u&&n&&(c.Pe||(c.Pe=m(e),w(c.Pe,'btn'),w(c.Pe,'btn--close'),x(c.Pe,'click',(()=>{C([])})),h(c.Qe,c.Pe)),g(c.Pe,'aria-label',u)),h(c.Qe,c.We),(d||f||_)&&h(c.Qe,c.Xe),h(c.Ce,c.Qe),h(c.Ke,c.Ce)}b&&(c.Ye||(c.Ye=m('div'),c.Ye.className=c.Ye.id='cm__title',g(c.Ye,'role','heading'),g(c.Ye,'aria-level','2'),h(c.We,c.Ye)),c.Ye.innerHTML=b);let S=l.description;if(S&&(a.F&&(S=S.replace('{{revisionMessage}}',a.O?'':l.revisionMessage||'')),c.Ze||(c.Ze=m('div'),c.Ze.className=c.Ze.id='cm__desc',h(c.We,c.Ze)),c.Ze.innerHTML=S),d&&(c.et||(c.et=m(e),w(c.et,'btn'),g(c.et,'data-role','all'),x(c.et,'click',(()=>{C('all')}))),c.et.innerHTML=d),f&&(c.Ve||(c.Ve=m(e),w(c.Ve,'btn'),g(c.Ve,'data-role','necessary'),x(c.Ve,'click',(()=>{C([])}))),c.Ve.innerHTML=f),_&&(c.tt||(c.tt=m(e),w(c.tt,'btn'),w(c.tt,'btn--secondary'),g(c.tt,'data-role','show'),x(c.tt,'mouseenter',(()=>{a.A||L(t,n)})),x(c.tt,'click',i)),c.tt.innerHTML=_),c.ot||(c.ot=m('div'),w(c.ot,'btn-group'),f&&h(c.ot,c.Ve),d&&h(c.ot,c.et),(d||f)&&h(c.Qe,c.ot),h(c.Xe,c.ot)),c.tt&&!c.nt&&(c.nt=m('div'),c.Ve&&c.et?(w(c.nt,'btn-group'),h(c.nt,c.tt),h(c.Xe,c.nt)):(h(c.ot,c.tt),w(c.ot,'btn-group--uneven'))),p){if(!c.ct){let e=m('div'),t=m('div');c.ct=m('div'),w(e,'footer'),w(t,'links'),w(c.ct,'link-group'),h(t,c.ct),h(e,t),h(c.Ce,e)}c.ct.innerHTML=p}G(0),a.M||(a.M=!0,P(o.fe.ve,'consentModal',c.Ce),n(t),setTimeout(V,10),h(c.qe,c.Ke),setTimeout((()=>y(c.Ke,'cc--anim')),100)),N(c.Qe,t,L,n)},$=e=>s(e)&&e in o.o._,q=()=>o.o.l||o.o.i.language.default,K=e=>{e&&(o.o.l=e)},Q=async e=>{const t=o.o;let n;n=e&&$(e)?e:q();let a=t._[n];if(!a)return!1;if(s(a)){const e=await(async e=>{try{const t=await fetch(e,{method:'GET'});return!!t.ok&&await t.json()}catch(e){return!1}})(a);if(!e)return!1;a=e}return t.u=a,K(n),!0},W=()=>{let e=o.o.i.language.rtl,t=o.ie.qe;e&&t&&(c(e)||(e=[e]),a(e,o.o.l)?y(t,'cc--rtl'):S(t,'cc--rtl'))},X=e=>{const t=o.ie;if(!t.qe){t.qe=m('div'),t.qe.id='cc-main',t.qe.style.position='fixed',t.qe.style.zIndex='2147483647',W();let n=o.o.i.root;n&&s(n)&&(n=document.querySelector(n)),h(n||t.Ue.body,t.qe),(({hidePreferences:e})=>{const t=o.ie;x(t.qe,'click',(n=>{const a=o.o;a.V?t.Se.contains(n.target)?a.N=!0:(e(),a.N=!1):a.T&&t.Ce.contains(n.target)&&(a.N=!0)}))})(e)}},Y=e=>{const{hostname:t,protocol:n}=location,{name:c,path:s,domain:i,sameSite:r}=o.t.cookie,l=encodeURIComponent(JSON.stringify(o.o.p)),d=e?(()=>{const e=o.o.C,t=e?new Date-e:0;return 864e5*D()-t})():864e5*D(),f=new Date;f.setTime(f.getTime()+d);let _=c+'='+l+(0!==d?'; expires='+f.toUTCString():'')+'; Path='+s+'; SameSite='+r;a(t,'.')&&(_+='; Domain='+i),'https:'===n&&(_+='; Secure'),document.cookie=_,o.o.p},Z=(e,t,n)=>{const a=n||o.t.cookie.domain,c=t||o.t.cookie.path,s='www.'===a.slice(0,4),i=s&&a.substring(4),r=(e,t)=>{document.cookie=e+'=; path='+c+(t?'; domain=.'+t:'')+'; expires=Thu, 01 Jan 1970 00:00:01 GMT;'};for(const t of e)r(t),r(t,a),s&&r(t,i)},ee=e=>(e=>{let t;try{t=JSON.parse(decodeURIComponent(e))}catch(e){t={}}return t})(te(e||o.t.cookie.name,!0)),te=(e,t)=>{const o=document.cookie.match('(^|;)\\s*'+e+'\\s*=\\s*([^;]+)');return o?t?o.pop():e:''},oe=e=>{const t=document.cookie.split(/;\s*/),o=[];for(const n of t){let t=n.split('=')[0];if(e)try{e.test(t)&&o.push(t)}catch(e){}else o.push(t)}return o},ne=(e,t=[])=>{((e,t)=>{const{J:n,L:i,U:r,A:d,oe:f,ee:_}=o.o;let u=[];if(e){c(e)?u.push(...e):s(e)&&(u='all'===e?n:[e]);for(const e of n)f[e]=a(u,e)?l(_[e]):[]}else u=d?(()=>{const e=o.ie.re;if(!e)return[];let t=[];for(let o in e)e[o].checked&&t.push(o);return t})():i;u=u.filter((e=>!a(n,e)||!a(t,e))),u.push(...r),A(u)})(e,t),(e=>{const t=o.o,{oe:n,U:c,te:s,ee:i,J:r}=t,f=r;t.ae=k(s);for(const e of f){const t=i[e],o=l(t),r=n[e]?.length>0,f=a(c,e);if(0!==o.length){if(s[e]=[],f)s[e].push(...o);else if(r){const t=n[e];s[e].push(...t)}else s[e]=[];s[e]=d(s[e])}}})(),(()=>{const e=o.o;'opt-out'===o.t.mode&&e.k?e.j=E(e.$,e.L):e.j=E(e.L,e.p.categories);let t=e.j.length>0,c=!1;for(const t of e.J)e.ne[t]=E(e.te[t],e.ae[t]),e.ne[t].length>0&&(c=!0);const s=o.ie.re;for(let t in s)s[t].checked=a(e.L,t);for(const t of e.J){const n=o.ie.le[t],c=e.te[t];for(const e in n)n[e].checked=a(c,e)}e.h||(e.h=new Date),e.S||(e.S=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)))),e.p={categories:k(e.L),revision:o.t.revision,data:e.v,consentTimestamp:e.h.toISOString(),consentId:e.S,services:k(e.te)};let i=!1;(e.k||t||c)&&(e.k&&(e.k=!1,i=!0),e.C?e.C=new Date:e.C=e.h,e.p.lastConsentTimestamp=e.C.toISOString(),Y(),o.t.autoClearCookies&&(i||!e.k&&t)&&(e=>{const t=o.o,c=oe();t.R=!1;let s=e?t.J:t.j;s=s.filter((e=>{let o=t.G[e];return!!o&&!o.readOnly&&!!o.autoClear}));for(const o of s){const s=t.G[o].autoClear,i=s?.cookies||[],r=a(t.j,o),l=!a(t.L,o),d=r&&l;if(e&&l||!e&&d){!0===s.reloadPage&&d&&(t.R=!0);for(const e of i){let t=[];const o=e.name,a=e.domain,s=e.path;if(o instanceof RegExp)for(let e of c)o.test(e)&&t.push(e);else{let e=n(c,o);e>-1&&t.push(c[e])}t.length>0&&Z(t,s,a)}}}})(i),F()),i&&(P(o.fe._e),P(o.fe.ue),'opt-in'===o.t.mode)||((t||c)&&P(o.fe.pe),e.R&&location.reload())})()},ae=e=>{const t=o.o.k?[]:o.o.L;return a(t,e)},ce=(e,t)=>{const{J:n,ee:i}=o.o;if(!(e&&t&&s(t)&&a(n,t)&&0!==l(i[t]).length))return!1;((e,t)=>{const n=o.o,{ee:i,oe:r,A:f}=n,_=o.ie.le[t]||{},u=o.ie.re[t]||{},m=l(i[t]);if(r[t]=[],s(e)){if('all'===e){if(r[t].push(...m),f)for(let e in _)_[e].checked=!0,p(_[e])}else if(a(m,e)&&r[t].push(e),f)for(let t in _)_[t].checked=e===t,p(_[t])}else if(c(e))for(let o of m){const n=a(e,o);n&&r[t].push(o),f&&(_[o].checked=n,p(_[o]))}const g=0===r[t].length;n.L=g?n.L.filter((e=>e!==t)):d([...n.L,t]),f&&(u.checked=!g,p(u))})(e,t),ne()},se=(e,t)=>{const n=o.o.k?[]:o.o.te[t];return a(n,e)},ie=e=>''!==te(e,!0),re=(e,t,o)=>{let n=[];const a=e=>{if(s(e)){let t=te(e);''!==t&&n.push(t)}else n.push(...oe(e))};if(c(e))for(let t of e)a(t);else a(e);Z(n,t,o)},le=e=>{const{ie:t,o:n}=o;e&&!n.M&&z(ue,X),n.M&&(n.T=!0,n.g&&I(!0),y(t.we,'show--consent'),g(t.Ce,'aria-hidden','false'),setTimeout((()=>{n.K=f(),n.P=n.X}),200),P(o.fe.me,'consentModal'))},de=()=>{const{ie:e,o:t,fe:n}=o;t.M&&(t.T=!1,t.g&&I(),S(e.we,'show--consent'),g(e.Ce,'aria-hidden','true'),setTimeout((()=>{t.K.focus(),t.P=[]}),200),P(n.ge,'consentModal'))},fe=()=>{const e=o.o;e.A&&e.D||(e.A||L(ue,X),y(o.ie.we,'show--preferences'),g(o.ie.Se,'aria-hidden','false'),e.D=!0,setTimeout((()=>{e.V=!0}),1),setTimeout((()=>{e.T?e.W=f():e.K=f(),0!==e.Y.length&&(e.Y[0].focus(),e.P=e.Y)}),200),P(o.fe.me,'preferencesModal'))},_e=()=>{const e=o.o;e.D&&(S(o.ie.we,'show--preferences'),g(o.ie.Se,'aria-hidden','true'),e.D=!1,setTimeout((()=>{e.V=!1}),1),e.T?(e.W&&e.W.focus(),e.P=e.X):(e.K&&e.K.focus(),e.P=[]),e.N=!1,P(o.fe.ge,'preferencesModal'))};var ue={show:le,hide:de,showPreferences:fe,hidePreferences:_e,acceptCategory:ne};const pe=async(e,t)=>{if(!$(e))return!1;const n=o.o;return!(e===q()&&!0!==t||!await Q(e)||(K(e),n.M&&z(ue,X),n.A&&L(ue,X),W(),V(),0))},me=()=>{const{B:e,te:t}=o.o,{accepted:n,rejected:c}=(()=>{const{k:e,L:t,J:n}=o.o;return{accepted:t,rejected:e?[]:n.filter((e=>!a(t,e)))}})();return k({acceptType:e,acceptedCategories:n,rejectedCategories:c,acceptedServices:t,rejectedServices:M()})},ge=(e,t)=>{let o=document.querySelector('script[src="'+e+'"]');return new Promise((n=>{if(o)return n(!0);if(o=m('script'),i(t))for(const e in t)g(o,e,t[e]);o.onload=()=>n(!0),o.onerror=()=>{o.remove(),n(!1)},o.src=e,h(document.head,o)}))},ve=e=>{let t,n=e.value,a=e.mode,c=!1;const s=o.o;if('update'===a){s.v=t=be('data');const e=typeof t==typeof n;if(e&&'object'==typeof t){!t&&(t={});for(let e in n)t[e]!==n[e]&&(t[e]=n[e],c=!0)}else!e&&t||t===n||(t=n,c=!0)}else t=n,c=!0;return c&&(s.v=t,s.p.data=t,Y(!0)),c},be=(e,t)=>{const o=ee(t);return e?o[e]:o},he=e=>{const t=o.t,n=o.o.i;return e?t[e]||n[e]:{...t,...n,cookie:{...t.cookie}}},ye=()=>!o.o.k,we=async e=>{const{o:t,t:n,fe:r}=o,d=window;if(!d._ccRun){if(d._ccRun=!0,(e=>{const{ie:t,t:n,o:c}=o,s=n,r=c,{cookie:d}=s,f=o.de,_=e.cookie,p=e.categories,m=l(p)||[],g=navigator,v=document;t.Ue=v,t.we=v.documentElement,d.domain=location.hostname,r.i=e,r._=e.language.translations,r.G=p,r.J=m,r.g=!!e.disablePageInteraction,f._e=e.onFirstConsent,f.ue=e.onConsent,f.pe=e.onChange,f.ge=e.onModalHide,f.me=e.onModalShow,f.ve=e.onModalReady;const{mode:h,autoShow:y,autoClearCookies:w,revision:C,manageScriptTags:S,hideFromBots:k,lazyHtmlGeneration:M}=e;'opt-out'===h&&(s.mode=h),'boolean'==typeof y&&(s.autoShow=y),'boolean'==typeof w&&(s.autoClearCookies=w),'boolean'==typeof S&&(s.manageScriptTags=S),'number'==typeof C&&C>=0&&(s.revision=C,r.F=!0),'boolean'==typeof M&&(s.lazyHtmlGeneration=M),!1===k&&(s.hideFromBots=!1),!0===s.hideFromBots&&g&&(r.q=g.userAgent&&/bot|crawl|spider|slurp|teoma/i.test(g.userAgent)||g.webdriver),i(_)&&(s.cookie={...d,..._}),s.autoClearCookies,r.F,s.manageScriptTags,(e=>{const{G:t,ee:n,te:a,oe:c,U:s}=o.o;for(let r of e){const e=t[r],d=e.services||{},f=i(d)&&l(d)||[];n[r]={},a[r]=[],c[r]=[],e.readOnly&&(s.push(r),a[r]=f),o.ie.le[r]={};for(let e of f){const t=d[e];t.ke=!1,n[r][e]=t}}})(m),(()=>{if(!o.t.manageScriptTags)return;const e=o.o;e.ce=u(o.ie.Ue,'script[data-category]'),e.se=[];for(const t of e.ce){let o=b(t,'data-category'),n=t.dataset.service||'',c=!1;if(o&&'!'===o.charAt(0)&&(o=o.slice(1),c=!0),'!'===n.charAt(0)&&(n=n.slice(1),c=!0),a(e.J,o)&&(e.se.push({xe:!1,De:c,Me:o,Te:n}),n)){const t=e.ee[o];t[n]||(t[n]={ke:!1})}}})(),K((()=>{const e=o.o.i.language.autoDetect;if(e){let t;if('browser'===e?t=navigator.language.slice(0,2).toLowerCase():'document'===e&&(t=document.documentElement.lang),$(t))return t}return q()})())})(e),t.q)return;(()=>{const e=o.o,t=o.t,n=ee(),{categories:a,services:i,consentId:r,consentTimestamp:l,lastConsentTimestamp:d,data:f,revision:_}=n,u=c(a);e.p=n,e.S=r;const p=!!r&&s(r);e.h=l,e.h&&(e.h=new Date(l)),e.C=d,e.C&&(e.C=new Date(d)),e.v=void 0!==f?f:null,e.F&&p&&_!==t.revision&&(e.O=!1),e.k=!(p&&e.O&&e.h&&e.C&&u),e.k,e.k?'opt-out'===t.mode&&((()=>{const e=o.o;for(const t of e.J){const o=e.G[t];if(o.enabled||o.readOnly){e.$.push(t);const o=e.ee[t]||{};for(let n in o)e.te[t].push(n)}}})(),e.L=[...e.$]):(e.te={...e.te,...i},A([...e.U,...a])),e.oe={...e.te}})();const p=ye();if(!await Q())return!1;if(await(async e=>{N(null,e,L,X),o.o.k&&z(e,X),o.t.lazyHtmlGeneration||L(e,X),(()=>{const e=o.ie,t=o.o;x(e.we,'keydown',(e=>{if('Tab'!==e.key)return;const n=t.P;if(n.length>0){const a=f();e.shiftKey?a===n[0]&&(n[1].focus(),_(e)):a===n[1]&&(n[0].focus(),_(e)),t.H||o.o.N||(t.H=!0,!t.I&&_(e),e.shiftKey?n[1].focus():n[0].focus())}!t.H&&(t.I=!0)}),!0)})()})(ue),n.autoShow&&!p&&le(!0),p)return F(),P(r.ue);'opt-out'===n.mode&&F(t.$)}},Ce=e=>{const{qe:n,we:a}=o.ie,{name:c,path:s,domain:i}=o.t.cookie;e&&re(c,s,i);for(const{be:e,he:t,ye:n}of o.o.m)e.removeEventListener(t,n);n?.remove(),a?.classList.remove('disable--interaction','show--preferences','show--consent');const r=new t;for(const e in o)o[e]=r[e];window._ccRun=!1};export{ne as acceptCategory,ce as acceptService,ae as acceptedCategory,se as acceptedService,re as eraseCookies,he as getConfig,be as getCookie,me as getUserPreferences,de as hide,_e as hidePreferences,ge as loadScript,Ce as reset,we as run,ve as setCookieData,pe as setLanguage,le as show,fe as showPreferences,ye as validConsent,ie as validCookie};
