const e={mode:'opt-in',revision:0,autoShow:!0,autoClearCookies:!0,manageScriptTags:!0,hideFromBots:!0,cookie:{name:'cc_cookie',expiresAfterDays:182,domain:'',path:'/',sameSite:'Lax'}},t={t:0,o:0,i:0},a={t:new Event('cc:onFirstConsent'),o:new Event('cc:onConsent'),i:new Event('cc:onChange')},n=e=>{function n(e){return'function'==typeof e}window.dispatchEvent(e),e===a.t&&n(t.t)&&t.t(i.l),e===a.o&&n(t.o)&&t.o(i.l),e===a.i&&n(t.i)&&t.i(i.l,i._)},o={p:0,u:0,v:0,m:0,g:0,h:0,C:0,k:0,M:0,T:0,S:0,A:0,B:0,N:0,D:0,H:0,O:0,V:0,F:0,J:0,j:0,P:0,I:0,G:0,L:0,R:0,U:0,q:0},r=e.cookie,i={X:null,K:'',W:{},Y:null,l:null,Z:null,$:null,ee:null,te:'',ae:!0,ne:!1,oe:!1,re:!1,ie:!1,ce:[],le:!1,de:!0,_:[],se:!1,_e:'',pe:!1,ue:[],ve:[],me:[],fe:[],ge:!1,be:!1,we:!1,he:[],ye:[],Ce:[]},c=(e,t)=>e.indexOf(t),l=(e,t)=>-1!==e.indexOf(t),d=e=>{var t=document.createElement(e);return'button'===e&&s(t,'type',e),t},s=(e,t,a)=>{e.setAttribute(t,a)},_=(e,t)=>{e.appendChild(t)},p=(e,t,a,n)=>{e.addEventListener(t,a,!0===n&&{passive:!0})},u=e=>{if('object'==typeof e)return Object.keys(e)},v=(e,t)=>{e.classList.add(t)},m=(e,t)=>{e.classList.remove(t)},f=()=>{var e=r.expiresAfterDays;return'function'==typeof e?e(i._e):e},g=e=>{var t='custom';return e.accepted.length===i.ue.length?t='all':e.accepted.length===i.me.length&&(t='necessary'),t},b=(e,t)=>{for(var a='accept-',n=d('show-preferencesModal'),o=d('show-consentModal'),r=d(a+'all'),i=d(a+'necessary'),c=d(a+'custom'),l=0;l<n.length;l++)s(n[l],'aria-haspopup','dialog'),p(n[l],'click',(e=>{e.preventDefault(),t.showPreferences(0)}));for(l=0;l<o.length;l++)s(o[l],'aria-haspopup','dialog'),p(o[l],'click',(e=>{e.preventDefault(),t.show(0,!0)}));for(l=0;l<r.length;l++)p(r[l],'click',(e=>{_(e,'all')}));for(l=0;l<c.length;l++)p(c[l],'click',(e=>{_(e)}));for(l=0;l<i.length;l++)p(i[l],'click',(e=>{_(e,[])}));function d(t){return(e||document).querySelectorAll('a[data-cc="'+t+'"], button[data-cc="'+t+'"]')}function _(e,a){e.preventDefault(),t.accept(a),t.hidePreferences(),t.hide()}},w=()=>{var e=i.ue.filter((e=>!l(i.ve,e)));return{accepted:i.ve,rejected:e}},h=t=>{if(e.manageScriptTags){var a=document.querySelectorAll('script[data-cookiecategory]'),n=t||i.l.categories||[],o=(e,t)=>{if(t<e.length){var a=e[t],r=a.getAttribute('data-cookiecategory');if(l(n,r)){a.removeAttribute('type'),a.removeAttribute('data-cookiecategory');var i=a.getAttribute('data-src');i&&a.removeAttribute('data-src');var c=d('script');if(c.textContent=a.innerHTML,((e,t)=>{for(var a=t.attributes,n=a.length,o=0;o<n;o++){var r=a[o].nodeName;s(e,r,t[r]||t.getAttribute(r))}})(c,a),i?c.src=i:i=a.src,i&&(c.onload=()=>{c.onload=null,o(e,++t)}),a.parentNode.replaceChild(c,a),i)return}o(e,++t)}};o(a,0)}};var y=!1,C=!1;const k=e=>{var t=i.X.guiOptions,a=t&&t.consentModal,n=t&&t.preferencesModal;function r(t,a,n,r,i){var c=n&&n.layout,d=n&&n.position,s=n&&!0===n.flipButtons,_=n&&!1===n.equalWeightButtons,p=c&&c.split(' ')||[],u=d&&d.split(' ')||[],m=p[0],f=p[1],g=u[0],b='pm--'===r?u[0]:u[1],w=m,h=a[m];h||(h=a[i],w=i);var k=l(h.ke,f)&&f,M=l(h.Me,g)?g:h.Te,T=l(h.xe,b)?b:h.Se;v(t,r+w),k&&v(t,r+k),M&&v(t,r+M),T&&v(t,r+T),s&&v(t,r+'flip'),_&&('cm--'===r?(o.N&&v(o.N,'cm__btn--secondary'),o.O&&v(o.O,'cm__btn--secondary')):o.U&&v(o.U,'pm__btn--secondary')),0===e?y=!0:C=!0}if(0===e&&!y&&i.ne){var c=['middle','top','bottom'],d=['left','center','right'],s={box:{ke:['wide','inline'],Me:c,xe:d,Te:'bottom',Se:'right'},cloud:{ke:['inline'],Me:c,xe:d,Te:'bottom',Se:'center'},bar:{ke:['inline'],Me:c.slice(1),xe:[],Te:'bottom',Se:''}};r(o.g,s,a,'cm--','box')}1!==e||C||r(o.V,{box:{ke:[],Me:[],xe:[],Te:'',Se:''},bar:{ke:['wide'],Me:[],xe:['left','right'],Te:'',Se:'left'}},n,'pm--','box')},M=e=>{var t=i.Y.consentModal;if(t){!0===i.X.disablePageInteraction&&v(o.p,'disable--interaction');var a=t.acceptAllBtn,n=t.acceptNecessaryBtn,r=t.showPreferencesBtn,c=t.closeIconLabel,l=t.footer;o.v||(o.v=d('div'),o.g=d('div'),o.h=d('div'),o.C=d('div'),o.T=d('div'),v(o.v,'cm-wrapper'),v(o.g,'cm'),v(o.h,'cm__body'),v(o.C,'cm__texts'),v(o.T,'cm__btns'),s(o.g,'role','dialog'),s(o.g,'aria-modal','true'),s(o.g,'aria-hidden','false'),s(o.g,'aria-labelledby','cm__title'),s(o.g,'aria-describedby','cm__desc'),o.g.style.visibility='hidden',c&&(o.O||(o.O=d('button'),o.O.className='cm__btn cm__btn--close',p(o.O,'click',(()=>{e.hide(),e.accept([])})),_(o.h,o.O)),s(o.O,'aria-label',c)),_(o.h,o.C),(a||n||r)&&_(o.h,o.T),_(o.g,o.h),_(o.v,o.g),_(o.u,o.v));var u=t.title;u&&(o.k||(o.k=d('div'),o.k.className=o.k.id='cm__title',s(o.k,'role','heading'),s(o.k,'aria-level','2'),_(o.C,o.k)),o.k.innerHTML=u);var m=t.description;if(m&&(i.le&&(m=m.replace('{{revisionMessage}}',i.de?'':t.revisionMessage||'')),o.M||(o.M=d('div'),o.M.className=o.M.id='cm__desc',_(o.C,o.M)),o.M.innerHTML=m),a&&(o.B||(o.B=d('button'),v(o.B,'cm__btn'),p(o.B,'click',(()=>{e.hide(),e.accept('all')}))),o.B.innerHTML=a),n&&(o.N||(o.N=d('button'),v(o.N,'cm__btn'),p(o.N,'click',(()=>{e.hide(),e.accept([])}))),o.N.innerHTML=n),r&&(o.D||(o.D=d('button'),o.D.className='cm__btn cm__btn--secondary',p(o.D,'click',(()=>{e.showPreferences()}))),o.D.innerHTML=r),!o.A&&r&&(o.A=d('div'),v(o.A,'cm__btn-group'),_(o.A,o.D),_(o.T,o.A)),o.S||(o.S=d('div'),v(o.S,'cm__btn-group'),n&&_(o.S,o.N),a&&_(o.S,o.B),(a||n)&&_(o.h,o.S),_(o.T,o.S)),l){if(!o.H){var f=d('div'),g=d('div');o.H=d('div'),v(f,'cm__footer'),v(g,'cm__links'),v(o.H,'cm__link-group'),_(g,o.H),_(f,g),_(o.g,f)}o.H.innerHTML=l}i.ne=!0,k(0)}},T=e=>{var t=i.Y.preferencesModal;if(t){var a=t.title,n=t.closeIconLabel,r=t.acceptAllBtn,c=t.acceptNecessaryBtn,f=t.savePreferencesBtn,g=t.sections;if(o.m)o.I=d('div'),v(o.I,'pm__body');else{o.m=d('div'),v(o.m,'pm-wrapper'),o.V=d('div'),o.V.style.visibility='hidden',v(o.V,'pm'),s(o.V,'role','dialog'),s(o.V,'aria-hidden',!0),s(o.V,'aria-modal',!0),p(o.p,'keydown',(t=>{27===(t=t||window.event).keyCode&&e.hidePreferences()}),!0),o.F=d('div'),v(o.F,'pm__header'),o.J=d('div'),v(o.J,'pm__title'),s(o.J,'role','heading'),o.j=d('button'),v(o.j,'pm__close-btn'),s(o.j,'aria-label',t.closeIconLabel||''),p(o.j,'click',(()=>{e.hidePreferences()})),o.P=d('div'),v(o.P,'pm__body'),o.L=d('div'),v(o.L,'pm__footer');var b=d('div');v(b,'pm__btns');var w=d('div'),h=d('div');v(w,'pm__btn-group'),v(h,'pm__btn-group'),_(o.L,h),_(o.L,w),_(o.F,o.J),_(o.F,o.j),_(o.V,o.F),_(o.V,o.P),_(o.V,o.L),_(o.m,o.V),_(o.u,o.m)}a&&(o.J.innerHTML=a,n&&s(o.j,'aria-label',n)),g&&g.forEach((e=>{var t=e.title,a=e.description,n=e.linkedCategory,r=n&&i.pe[n],c=e.cookieTable,f=c&&c.body,g=f&&f.length>0,b=!!r||g,w=d('div');if(v(w,'pm__section'),t){var h=d('div'),y=d(b?'button':'div');if(v(h,'pm__section-title-wrapper'),v(y,'pm__section-title'),y.innerHTML=t,_(h,y),b){var C=n+'-desc';w.className+='--expandable',s(y,'aria-expanded',!1),s(y,'aria-controls',C);var k=d('label'),M=d('input'),T=d('span'),x=d('span'),S=d('span'),A=d('span');M.type='checkbox',v(k,'section__toggle-wrapper'),v(M,'section__toggle'),v(S,'toggle__icon-on'),v(A,'toggle__icon-off'),v(T,'toggle__icon'),v(x,'toggle__label'),s(T,'aria-hidden','true'),M.value=n,x.textContent=t,_(T,S),_(T,A),i.ae?(r.enabled||r.readOnly)&&(M.checked=!0,r.enabled&&!o.I&&i.fe.push(n)):l(i.l.categories,n)&&(M.checked=!0),r.readOnly&&(M.disabled=!0),_(k,M),_(k,T),_(k,x),_(h,k)}else s(y,'role','heading'),s(y,'aria-level','3');_(w,h)}if(a){var B=d('div'),N=d('div');if(v(B,'pm__section-desc-wrapper'),v(N,'pm__section-desc'),N.innerHTML=a,_(B,N),b&&(s(B,'aria-hidden','true'),B.id=C,((e,t,a)=>{p(y,'click',(()=>{t.classList.contains('is-expanded')?(m(t,'is-expanded'),s(a,'aria-expanded','false'),s(e,'aria-hidden','true')):(v(t,'is-expanded'),s(a,'aria-expanded','true'),s(e,'aria-hidden','false'))}),!1)})(B,w,y),g)){var D=d('table'),E=d('thead'),H=d('tbody');v(D,'pm__section-table'),v(E,'pm__table-head'),v(H,'pm__table-body');var O=c.headers,V=u(O),F=document.createDocumentFragment(),J=d('tr');s(J,'role','row');for(var j=0;j<V.length;j++){var P=O[V[j]],I=d('th');I.id='cc__row-'+P,s(I,'role','columnheader'),s(I,'scope','col'),v(I,'pm__table-th'),I.innerHTML=P,_(F,I)}_(J,F),_(E,J);var G=document.createDocumentFragment();for(j=0;j<f.length;j++){var L=f[j],R=d('tr');s(R,'role','row'),v(R,'pm__table-tr');for(var U=0;U<V.length;U++){var q=V[U],X=O[q],z=L[q],K=d('td'),Q=d('div');v(K,'pm__table-td'),s(K,'data-column',X),s(K,'headers','cc__row-'+X),Q.insertAdjacentHTML('beforeend',z),_(K,Q),_(R,K)}_(G,R)}_(H,G),_(D,E),_(D,H),_(B,D)}_(w,B)}_(o.P,w),o.I?_(o.I,w):_(o.P,w)})),(r||c)&&(c&&(o.U||(o.U=d('button'),v(o.U,'pm__btn'),_(w,o.U),p(o.U,'click',(()=>{y([])}))),o.U.innerHTML=c),r&&(o.R||(o.R=d('button'),v(o.R,'pm__btn'),_(w,o.R),p(o.R,'click',(()=>{y('all')}))),o.R.innerHTML=r)),f&&(o.q||(o.q=d('button'),o.q.className='pm__btn pm__btn--secondary',_(h,o.q),p(o.q,'click',(()=>{y()}))),o.q.innerHTML=f),o.I&&(o.V.replaceChild(o.I,o.P),o.P=o.I),k(1)}function y(t){e.accept(t),e.hidePreferences(),e.hide()}},x=e=>{var t=u(i.W);return l(t,e)?e:l(t,i.K)?i.K:t[0]},S=(e,t)=>{e&&(i.K=x(e)),i.Y=i.W[i.K],'string'==typeof i.Y?((e,t)=>{var a=new XMLHttpRequest;a.onreadystatechange=()=>{if(4===a.readyState){var e,n=a.status;if(200===n)try{e=JSON.parse(a.responseText)}catch(e){}else a.statusText;t(n,e)}},a.open(e.method,e.path),a.send(e.data)})({method:'GET',path:i.Y},((e,a)=>{200===e&&(i.Y=a,i.W[i.K]=a,t())})):(i.Y=i.W[i.K],t())},A=e=>{var t=r.domain;i.se=!1;var a=N('','all'),n=[t,'.'+t];if('www.'===t.slice(0,4)){var o=t.substring(4);n.push(o,'.'+o)}var d=e?i.ue:i._;d=d.filter((e=>{var t=i.pe[e];return!!t&&!t.readOnly&&!!t.autoClear}));for(var s=0;s<d.length;s++){var _=d[s],p=i.pe[_].autoClear,u=p&&p.cookies||[],v=l(i._,_),m=!c(i.ve,_),f=v&&m;if(e&&m||!e&&f){var g=u.length;!0===p.reloadPage&&f&&(i.se=!0);for(var b=0;b<g;b++){var w=[],h=u[b].name,y=h&&'string'!=typeof h,C=u[b].domain||null,k=u[b].path||!1;if(C&&(n=[C,'.'+C]),y)for(var M=0;M<a.length;M++)h.test(a[M])&&w.push(a[M]);else{var T=c(a,h);T>-1&&w.push(a[T])}w.length>0&&D(w,k,n)}}}},B=(e,t,a)=>{var n,o=encodeURIComponent(t),c=a?(n=i.ee?new Date-i.ee:0,864e5*f()-n):864e5*f(),d=new Date;d.setTime(d.getTime()+c);var s=e+'='+(o||'')+(0!==c?'; expires='+d.toUTCString():'')+'; Path='+r.path+';';s+=' SameSite='+r.sameSite+';',l(window.location.hostname,'.')&&(s+=' Domain='+r.domain+';'),'https:'===window.location.protocol&&(s+=' Secure;'),document.cookie=s,JSON.parse(decodeURIComponent(o))},N=(e,t,a,n)=>{var o;if('one'===t){if((o=(o=document.cookie.match('(^|;)\\s*'+e+'\\s*=\\s*([^;]+)'))?a?o.pop():e:'')&&(e===r.name||n)){try{o=JSON.parse(decodeURIComponent(o))}catch(e){o={}}o=JSON.stringify(o)}}else if('all'===t){var i=document.cookie.split(/;\s*/);o=[];for(var c=0;c<i.length;c++)o.push(i[c].split('=')[0])}return o},D=(e,t,a)=>{for(var n=t||'/',o=0;o<e.length;o++){for(var r=0;r<a.length;r++)document.cookie=e[o]+'=; path='+n+(l(a[r],'.')?'; domain='+a[r]:'')+'; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';e[o]}},E={accept:(t,o)=>{var c=t||void 0,d=o||[],s=[];if(c)if('object'==typeof c&&'number'==typeof c.length)for(var _=0;_<c.length;_++)l(i.ue,c[_])&&s.push(c[_]);else'string'==typeof c&&('all'===c?s=i.ue.slice():l(i.ue,c)&&s.push(c));else s=(()=>{for(var e=document.querySelectorAll('.section__toggle')||[],t=[],a=0;a<e.length;a++)e[a].checked&&t.push(e[a].value);return t})();if(d.length>=1)for(_=0;_<d.length;_++)s=s.filter((e=>e!==d[_]));for(_=0;_<i.me.length;_++)l(s,i.me[_])||s.push(i.me[_]);i.ve=s,(()=>{i._=i.ve.filter((e=>!l(i.l.categories||[],e))).concat((i.l.categories||[]).filter((e=>!l(i.ve,e))));for(var t=i._.length>0,o=document.querySelectorAll('.section__toggle'),c=0;c<o.length;c++)l(i.ve,o[c].value)?o[c].checked=!0:o[c].checked=!1;!i.ae&&e.autoClearCookies&&t&&A(),i.$||(i.$=new Date),i.te||(i.te=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(e=>(e^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)))),i.l={categories:JSON.parse(JSON.stringify(i.ve)),revision:e.revision,data:i.Z,consentTimestamp:i.$.toISOString(),consentId:i.te};var d=!1;(i.ae||t)&&(i.ae&&(i.ae=!1,d=!0),i._e=g(w()),i.ee?i.ee=new Date:i.ee=i.$,i.l.lastConsentTimestamp=i.ee.toISOString(),B(r.name,JSON.stringify(i.l)),h()),d&&(e.autoClearCookies&&A(!0),n(a.t),n(a.o),'opt-in'===e.mode)||(t&&n(a.i),i.se&&window.location.reload())})()},validCookie:e=>''!==N(e,'one',!0),eraseCookies:(e,t,a)=>{var n=[],o=r.domain,i=a?[a,'.'+a]:[o,'.'+o];if('object'==typeof e&&e.length>0)for(var c=0;c<e.length;c++)E.validCookie(e[c])&&n.push(e[c]);else E.validCookie(e)&&n.push(e);D(n,t,i)},setLanguage:(e,t)=>{if('string'==typeof e){var a=x(e);return(a!==i.K||!0===t)&&(i.K=a,S(i.K,(()=>{i.ne&&(M(E),b(o.Ae,E)),T(E)})),!0)}},getUserPreferences:()=>{var e=!i.ae&&w();return{acceptType:i._e,acceptedCategories:i.ae?[]:e.accepted,rejectedCategories:i.ae?[]:e.rejected}},loadScript:(e,t,a)=>{var n='function'==typeof t;if(document.querySelector('script[src="'+e+'"]'))n&&t();else{var o=d('script');if(a&&a.length>0)for(var r=0;r<a.length;++r)a[r]&&s(o,a[r].name,a[r].value);n&&(o.onload=t),o.src=e,_(document.head,o)}},setCookieData:e=>{var t=e.value,a=!1;if('update'===e.mode){i.Z=E.getCookie('data');var n=typeof i.Z==typeof t;if(n&&'object'==typeof i.Z)for(var o in!i.Z&&(i.Z={}),t)i.Z[o]!==t[o]&&(i.Z[o]=t[o],a=!0);else!n&&i.Z||i.Z===t||(i.Z=t,a=!0)}else i.Z=t,a=!0;return a&&(i.l.data=i.Z,B(r.name,JSON.stringify(i.l),!0)),a},getCookie:(e,t)=>{var a=JSON.parse(N(t||r.name,'one',!0,!0)||'{}');return e?a[e]:a},getConfig:t=>e[t]||i.X[t],updateScripts:()=>{h()},show:(e,t)=>{!0===t&&M(E),i.ne&&setTimeout((()=>{v(o.p,'show--consent'),s(o.g,'aria-hidden','false'),i.oe=!0,setTimeout((()=>{i.be=document.activeElement,i.ce=i.he}),200)}),e>0?e:t?30:0)},hide:()=>{i.ne&&(m(o.p,'show--consent'),s(o.g,'aria-hidden','true'),i.oe=!1,setTimeout((()=>{i.be.focus(),i.ce=null}),200))},hidePreferences:()=>{m(o.p,'show--preferences'),i.re=!1,s(o.V,'aria-hidden','true'),setTimeout((()=>{i.oe?(i.we&&i.we.focus(),i.ce=i.he):(i.be&&i.be.focus(),i.ce=null),i.ie=!1}),200)},acceptedCategory:t=>{var a;return a=i.ae&&'opt-in'!==e.mode?i.fe:E.getUserPreferences().acceptedCategories,l(a,t)},showPreferences:e=>{setTimeout((()=>{v(o.p,'show--preferences'),s(o.V,'aria-hidden','false'),i.re=!0,setTimeout((()=>{i.oe?i.we=document.activeElement:i.be=document.activeElement,0!==i.ye.length&&(i.ye[3]?i.ye[3].focus():i.ye[0].focus(),i.ce=i.ye)}),200)}),e>0?e:0)},validConsent:()=>!i.ae,run:c=>{if(!document.getElementById('cc-main')){if((a=>{i.X=a,i.W=a.language.translations,i.pe=i.X.categories,i.ue=u(i.pe);for(var n=0;n<i.ue.length;n++)!0===i.pe[i.ue[n]].readOnly&&i.me.push(i.ue[n]);'boolean'==typeof a.autoShow&&(e.autoShow=a.autoShow);var c=a.cookie;if(c&&'object'==typeof c){var l=c.name,d=c.domain,s=c.path,_=c.sameSite,p=c.expiresAfterDays;l&&(r.name=l),d&&(r.domain=d),s&&(r.path=s),_&&(r.sameSite=_),p&&(r.expiresAfterDays=p)}t.t=a.onFirstConsent,t.o=a.onConsent,t.i=a.onChange;var v=a.mode,m=a.revision,f=a.autoClearCookies,g=a.manageScriptTags,b=a.hideFromBots;'opt-out'===v&&(e.mode=v),'number'==typeof m&&(m>-1&&(e.revision=m),i.le=!0),'boolean'==typeof f&&(e.autoClearCookies=f),'boolean'==typeof g&&(e.manageScriptTags=g),!1===b&&(e.hideFromBots=!1),!0===e.hideFromBots&&(i.ge=navigator&&(navigator.userAgent&&/bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)||navigator.webdriver)),e.autoClearCookies,i.le,e.manageScriptTags,i.K=function(){var e,t=i.X.language.autoDetect;if(t){if('browser'===t)return x(((e=navigator.language||navigator.browserLanguage).length>2&&(e=e[0]+e[1]),e.toLowerCase()));if('document'===t)return x(document.documentElement.lang)}return x(i.X.language.default)}(),i.Y=i.W[i.K],i.K,o.p=document.documentElement})(c),i.ge)return;i.l=JSON.parse(N(r.name,'one',!0)||'{}'),i.te=i.l.consentId;var l=void 0!==i.te;i.$=i.l.consentTimestamp,i.$&&(i.$=new Date(i.$)),i.ee=i.l.lastConsentTimestamp,i.ee&&(i.ee=new Date(i.ee));var s=i.l.data;i.Z=void 0!==s?s:null,i.le&&l&&i.l.revision!==e.revision&&(i.de=!1),i.ne=i.ae=!(l&&i.de&&i.$&&i.ee&&i.te),i.ae,i.ae||(i.ve=i.l.categories,i._e=g(w())),S(null,(()=>{(e=>{o.u=d('div'),o.u.id='cc-main',o.u.style.position='fixed',o.u.style.zIndex='1000000',i.ne&&M(e),T(e),_(i.X.root||document.body,o.u)})(E),(()=>{var e=['[href]','button','input','details','[tabindex="0"]'];function t(t,a){var n=!1,o=!1;try{for(var r,i=t.querySelectorAll(e.join(':not([tabindex="-1"]), ')),c=i.length,l=0;l<c;)r=i[l].getAttribute('data-focus'),o||'1'!==r?'0'===r&&(n=i[l],o||'0'===i[l+1].getAttribute('data-focus')||(o=i[l+1])):o=i[l],l++}catch(a){return t.querySelectorAll(e.join(', '))}a[0]=i[0],a[1]=i[i.length-1],a[2]=n,a[3]=o}t(o.V,i.ye),i.ne&&t(o.g,i.he)})(),b(null,E),e.autoShow&&i.ne&&E.show(),setTimeout((()=>{v(o.u,'c--anim')}),100),setTimeout((()=>{(e=>{var t=!1,a=!1;p(document,'keydown',(e=>{'Tab'===(e=e||window.event).key&&(i.ce&&(e.shiftKey?document.activeElement===i.ce[0]&&(i.ce[1].focus(),e.preventDefault()):document.activeElement===i.ce[1]&&(i.ce[0].focus(),e.preventDefault()),a||i.ie||(a=!0,!t&&e.preventDefault(),e.shiftKey?i.ce[3]?i.ce[2]?i.ce[2].focus():i.ce[0].focus():i.ce[1].focus():i.ce[3]?i.ce[3].focus():i.ce[0].focus())),!a&&(t=!0))})),document.contains&&p(o.u,'click',(t=>{t=t||window.event,i.re?o.V.contains(t.target)?i.ie=!0:(e.hidePreferences(0),i.ie=!1):i.oe&&o.g.contains(t.target)&&(i.ie=!0)}),!0)})(E)}),100),i.ae?'opt-out'===e.mode&&(e.mode,i.fe,h(i.fe)):(h(),n(a.o))}))}}};var H={init:()=>(r.domain=window.location.hostname,E)};export{H as default};