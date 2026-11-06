const currentLang=document.documentElement.lang;const t=window.hdgTranslate??(x=>x);
const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?t('닫기'):t('메뉴');nav.classList.toggle('open',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent=t('메뉴')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent=t('메뉴');menu.focus()}});
const stages=[['문제의 크기보다, 시작할 지점을 찾습니다.','현업의 업무 흐름과 데이터 상태를 함께 살펴보고, 효과와 실행 가능성을 기준으로 우선순위를 정합니다.',['현업 워크플로우와 반복 업무 매핑','데이터·시스템·권한 현황 점검','AX 기회 영역 및 우선순위 보고서']],['기술과 업무가 함께 작동하도록 설계합니다.','적용 시나리오, 데이터 활용 기준, 운영 지표와 책임 범위를 정의해 단계별 실행 계획을 세웁니다.',['AI 적용 시나리오와 실행 로드맵','데이터·권리·거버넌스 기준','운영 KPI 및 리스크 대응 모델']],['현장에서 사용할 수 있는 형태로 구현합니다.','AI 모델과 에이전트를 기존 시스템에 연결하고, 사용자 검증과 교육을 통해 운영을 준비합니다.',['AI 모델·업무 에이전트 구현','시스템 통합과 데이터 파이프라인','현장 워크숍 및 운영 인수인계']],['성과를 확인하며, 매일의 업무에 정착시킵니다.','품질과 운영 지표를 관찰하고 사용자 피드백을 반영합니다. 매뉴얼과 권한 체계를 함께 관리합니다.',['모니터링 및 품질 보고','KPI·사용자 피드백 기반 개선','운영 매뉴얼과 권한 체계 관리']],['검증한 변화부터 다음 영역으로 넓힙니다.','실제 성과를 바탕으로 새로운 시나리오를 추가하고, 조직과 업무 문화에 지속 가능한 변화를 정착시킵니다.',['성과 기반 적용 범위 확대','신규 시나리오 및 모듈 도입','현업 교육과 조직 변화관리']]];
const tabs=[...document.querySelectorAll('[role=tab]')];
function activate(index,focus=false){tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1});const panel=document.querySelector('#framework-panel');if(!panel)return;const s=stages[index].map(v=>Array.isArray(v)?v.map(t):t(v));panel.setAttribute('aria-labelledby',tabs[index].id);panel.innerHTML=`<div><h3>${s[0]}</h3><p>${s[1]}</p></div><ul>${s[2].map(x=>`<li>${x}</li>`).join('')}</ul>`;if(focus)tabs[index].focus()}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(i));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();activate(n,true)}})});if(tabs.length)activate(0);
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector(".project-grid").dataset.view=button.dataset.filter;let count=0;document.querySelectorAll('[data-category]').forEach(card=>{const show=button.dataset.filter==='all'||card.dataset.category===button.dataset.filter;card.hidden=!show;if(show)count++});const status=document.querySelector('#filter-status');if(status)status.textContent=currentLang==='en'?`Showing ${count} item${count===1?'':'s'}.`:currentLang==='ja'?`${count}件を表示しています。`:`${count}개 항목을 표시합니다.`}));
const form=document.querySelector('#inquiry-form');form?.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const content=`${t("아이레마 협업 문의")}\n\n${t("분야")}: ${d.get('topic')}\n${t("회사 / 기관")}: ${d.get('company')}\n${t("성함")}: ${d.get('name')}\n${t("회신 이메일")}: ${d.get('email')}\n\n${t("문의 내용")}\n${d.get('message')}\n\n${t("이 파일은 문의 초안이며 서버로 전송되지 않았습니다.")}`;const blob=new Blob(['\uFEFF',content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`AIReMa-inquiry-${currentLang}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);document.querySelector('#inquiry-status').textContent=t('문의 초안이 준비되었습니다. 다운로드한 파일을 확인해 주세요. 문의가 전송되지는 않았습니다.')});

document.querySelector(".language-switch")?.addEventListener("change",e=>{const dest=e.target.value;window.location.href=dest+window.location.hash});

const heroVideo=document.querySelector('.hero-video');
const heroVideoToggle=document.querySelector('.hero-video-toggle');
if(heroVideo&&heroVideoToggle){
 const videoLabels=currentLang==='ko'?['배경 영상 일시정지','배경 영상 재생']:currentLang==='ja'?['背景動画を一時停止','背景動画を再生']:['Pause background video','Play background video'];
 const syncVideoButton=()=>{heroVideoToggle.textContent=heroVideo.paused?'▶':'Ⅱ';heroVideoToggle.setAttribute('aria-label',videoLabels[heroVideo.paused?1:0]);};
 heroVideo.muted=true;
 heroVideo.addEventListener('play',syncVideoButton);heroVideo.addEventListener('pause',syncVideoButton);
 heroVideoToggle.addEventListener('click',()=>{if(heroVideo.paused)heroVideo.play().catch(syncVideoButton);else heroVideo.pause();});
 const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(motionPreference.matches){heroVideo.autoplay=false;heroVideo.pause();}else heroVideo.play().catch(syncVideoButton);
 motionPreference.addEventListener('change',e=>{if(e.matches)heroVideo.pause();});
 syncVideoButton();
}
/* v2: header state, scroll reveal, data-saver video */
(()=>{
 const hdr=document.querySelector('.header');
 if(hdr){const s=()=>hdr.classList.toggle('scrolled',window.scrollY>24);addEventListener('scroll',s,{passive:true});s()}
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if('IntersectionObserver' in window&&!reduce){
  document.documentElement.classList.add('js');
  const sel='.section-head,.identity-copy,.business-map article,.business-card,.pipeline>div,.framework,.project-card,.why-grid article,.stack,.contact-grid>*,.detail-item,.deliverables article,.origin-grid>*,.founder>*,.product-split>*,.detail-cta .wrap';
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  document.querySelectorAll(sel).forEach(el=>{const sib=[...el.parentElement.children].filter(c=>c.matches(sel));el.style.setProperty('--d',Math.max(0,sib.indexOf(el))*0.09+'s');el.classList.add('reveal');io.observe(el)});
 }
 const c=navigator.connection;
 if(c&&(c.saveData||/2g/.test(c.effectiveType||''))){const v=document.querySelector('.hero-video');if(v){v.pause();v.removeAttribute('autoplay');v.preload='none';v.querySelectorAll('source').forEach(s=>s.remove());v.load()}}
})();
