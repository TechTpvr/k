(function(){
  'use strict';
  const CURRENT_VERSION='10.0.0';
  const CURRENT_CODE=10;
  const ENDPOINT='./update.json';
  const RELEASE_KEY='kifnet_release_seen';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function injectStyle(){
    if($('#k10Style'))return;
    const s=document.createElement('style');s.id='k10Style';
    s.textContent=`
      .splashCenter{animation:k10Enter 1.8s cubic-bezier(.16,1,.3,1) both}
      .splashLogo{animation:k10Float 4.6s cubic-bezier(.4,0,.2,1) infinite}
      .splashCenter:before{animation:k10Glow 4.0s ease-in-out infinite}
      .splashProgress i{animation:k10Load 2.0s cubic-bezier(.4,0,.2,1) infinite}
      .splash:before{animation:k10Orbit 5.6s cubic-bezier(.2,.7,.2,1) infinite}
      .splash:after{animation:k10Orbit 7.2s .8s cubic-bezier(.2,.7,.2,1) infinite reverse}
      @keyframes k10Enter{0%{opacity:0;transform:translateY(24px) scale(.92);filter:blur(7px)}55%{opacity:1;transform:translateY(-4px) scale(1.012);filter:blur(0)}100%{opacity:1;transform:none}}
      @keyframes k10Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes k10Glow{0%,100%{transform:scale(.9);opacity:.4}50%{transform:scale(1.08);opacity:.8}}
      @keyframes k10Orbit{0%{transform:translate(-50%,-50%) scale(.45);opacity:0}18%{opacity:.55}72%{opacity:.12}100%{transform:translate(-50%,-50%) scale(1.35);opacity:0}}
      @keyframes k10Load{0%{transform:translateX(-140%)}55%{transform:translateX(160%)}100%{transform:translateX(360%)}}
      .k9Release{position:fixed;left:14px;right:14px;bottom:18px;z-index:12000;display:flex;gap:12px;align-items:flex-start;padding:15px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--card) 95%,transparent);backdrop-filter:blur(18px);box-shadow:0 18px 55px rgba(0,0,0,.16);animation:k10Sheet .45s cubic-bezier(.16,1,.3,1)}
      .k9Release[hidden]{display:none}.k9ReleaseIcon{width:42px;height:42px;flex:none;border-radius:14px;background:color-mix(in srgb,var(--p) 12%,var(--card));color:var(--p);display:grid;place-items:center;font-weight:800}
      .k9ReleaseBody{min-width:0;flex:1}.k9ReleaseBody b{display:block;font-size:14px}.k9ReleaseBody p{margin:5px 0 8px;color:var(--muted);font-size:11px;line-height:1.8}
      .k9ReleaseBody ul{margin:0 0 10px;padding-right:18px;color:var(--muted);font-size:11px;line-height:1.8}.k9ReleaseActions{display:flex;gap:7px}
      .k9ReleaseActions button{padding:8px 11px;border-radius:12px;background:var(--p);color:#fff;font-weight:700;font-size:11px}.k9ReleaseActions .secondary{background:var(--bg);color:var(--text)}
      @keyframes k10Sheet{from{opacity:0;transform:translateY(22px) scale(.98)}to{opacity:1;transform:none}}
      @media(min-width:700px){.k9Release{left:50%;right:auto;width:min(560px,calc(100% - 28px));transform:translateX(-50%)}}
      @media(prefers-reduced-motion:reduce){.splash *,.splash:before,.splash:after,.k9Release{animation:none!important}}
    `;
    document.head.appendChild(s);
  }

  function hideSplash(){
    const el=$('#splash');
    if(el)setTimeout(()=>el.classList.add('hide'),2350);
  }

  function platformUrl(info){
    const ua=navigator.userAgent||'';
    if(window.KifNetNative?.isNative) return /android/i.test(ua)?(info.androidUrl||info.webUrl):(info.iosUrl||info.webUrl);
    return info.webUrl||info.androidUrl||info.iosUrl;
  }

  function showRelease(info,isUpdate){
    if(!info)return;
    const code=Number(info.versionCode)||0;
    const key=(isUpdate?'update:':'release:')+code;
    if(localStorage.getItem(RELEASE_KEY)===key)return;
    const old=$('#k9Release');if(old)old.remove();
    const box=document.createElement('section');box.id='k9Release';box.className='k9Release';
    const changes=Array.isArray(info.changes)?info.changes:[];
    box.innerHTML=`<div class="k9ReleaseIcon">✓</div><div class="k9ReleaseBody"><b>${esc(info.title||'به‌روزرسانی کیف‌نت')}</b><p>${esc(info.message||'تغییرات جدید آماده است.')}</p>${changes.length?'<ul>'+changes.slice(0,6).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}<div class="k9ReleaseActions"><button data-open>${isUpdate?'بروزرسانی':'متوجه شدم'}</button><button class="secondary" data-close>بعداً</button></div></div>`;
    document.body.appendChild(box);
    const close=()=>{localStorage.setItem(RELEASE_KEY,key);box.remove()};
    $('[data-close]',box).onclick=close;
    $('[data-open]',box).onclick=()=>{if(isUpdate){const u=platformUrl(info);if(window.KifNetNative?.openExternal)window.KifNetNative.openExternal(u).catch(()=>location.href=u);else location.href=u;}else close()};
  }

  async function check(){
    try{
      const r=await fetch(ENDPOINT+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok)return;
      const info=await r.json();
      const remote=Number(info.versionCode)||0;
      if(remote>CURRENT_CODE) showRelease(info,true);
      else if(remote===CURRENT_CODE) showRelease(info,false);
    }catch(e){console.warn('KifNet update check failed',e)}
  }

  injectStyle();hideSplash();
  const startBackgroundTasks=()=>{
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
    check();
  };
  if('requestIdleCallback' in window) requestIdleCallback(startBackgroundTasks,{timeout:3200});
  else setTimeout(startBackgroundTasks,3200);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  window.addEventListener('online',check);
  window.KifNetApp={version:CURRENT_VERSION,versionCode:CURRENT_CODE,checkForUpdate:check};
})();