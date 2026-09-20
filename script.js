/* LE TABAC EXCLUSIVO interactions */
/* LTE maison interactions */
(function(){var KEY='lte_entered';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var gate=document.getElementById('entry');
function close(){if(!gate)return;gate.classList.remove('visible');gate.setAttribute('aria-hidden','true');document.body.classList.remove('entry-open');}
var yes=document.getElementById('entry-yes'),no=document.getElementById('entry-no'),err=document.getElementById('entry-error');
if(gate&&!gate.classList.contains('visible')){gate.setAttribute('aria-hidden','true');}
if(yes)yes.addEventListener('click',function(){try{sessionStorage.setItem(KEY,'1');}catch(e){} if(err)err.textContent='';close();document.dispatchEvent(new CustomEvent('lte:entered'));});
if(no)no.addEventListener('click',function(){if(err)err.textContent='This maison is for adults over 21 only.';});
var mast=document.getElementById('masthead');
window.addEventListener('scroll',function(){if(mast)mast.classList.toggle('scrolled',window.scrollY>10);},{passive:true});
var drawer=document.getElementById('drawer'),veil=document.getElementById('drawer-veil'),openBtn=document.getElementById('menu-open'),closeBtn=document.getElementById('menu-close');
function setDrawer(o){if(!drawer)return;drawer.classList.toggle('open',o);if(veil)veil.classList.toggle('show',o);if(openBtn)openBtn.setAttribute('aria-expanded',String(o));}
if(openBtn)openBtn.addEventListener('click',function(){setDrawer(true);});
if(closeBtn)closeBtn.addEventListener('click',function(){setDrawer(false);});
if(veil)veil.addEventListener('click',function(){setDrawer(false);});
if(drawer)drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setDrawer(false);});});
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('visible');io.unobserve(en.target);}});},{threshold:.12});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
document.querySelectorAll('.tab').forEach(function(btn){btn.addEventListener('click',function(){
document.querySelectorAll('.tab').forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false');});
btn.classList.add('active');btn.setAttribute('aria-selected','true');
var f=btn.getAttribute('data-filter');
document.querySelectorAll('.cigar-card').forEach(function(card){card.classList.toggle('hidden',!(f==='all'||card.getAttribute('data-origin')===f));});
});});
window.LTE_ESC=esc;
})();

/* LTE settings, boutiques, rituals part 1 */
(function(){
var S=(window.LTE_SETTINGS&&typeof window.LTE_SETTINGS==='object')?window.LTE_SETTINGS:{contact:{},locations:[]};
var esc=window.LTE_ESC||function(s){return String(s||'');};
function setLink(id,href){var el=document.getElementById(id);if(!el||!href)return;el.href=href;}
var c=S.contact||{},locs=Array.isArray(S.locations)?S.locations:[];
if(c.whatsapp){setLink('topbar-wa','https://wa.me/'+c.whatsapp);setLink('contact-wa','https://wa.me/'+c.whatsapp);}
if(c.whatsappBot)setLink('footer-wa','https://wa.me/'+c.whatsappBot);
if(c.instagram){setLink('contact-ig',c.instagram);setLink('footer-ig',c.instagram);}
if(c.email)setLink('contact-email','mailto:'+c.email);
var sel=document.getElementById('r-boutique');
if(sel&&locs.length){sel.innerHTML='<option value="" disabled selected>Select a boutique</option>'+locs.map(function(l){return '<option value="'+esc(l.label)+'">'+esc(l.label)+'</option>';}).join('');}
var foot=document.getElementById('footer-boutiques');
if(foot&&locs.length){foot.innerHTML=locs.map(function(l){return '<a href="#boutiques" data-b="'+esc(l.label)+'">'+esc(l.name||l.title)+'</a>';}).join('');}
window.LTE_STATE={contact:c,locations:locs};
})();

/* LTE boutiques map + rituals + forms + concierge */
(function(){
var st=window.LTE_STATE||{contact:{},locations:[]};
var esc=window.LTE_ESC||function(s){return String(s||'');};
var c=st.contact||{},locs=st.locations||[];
var sw=document.getElementById('boutique-switch'),cards=document.getElementById('boutique-cards'),mapEl=document.getElementById('boutique-map'),map=null,markers=[],active=0;
function render(){
if(sw)sw.innerHTML=locs.map(function(l,i){return '<button type="button" data-i="'+i+'" class="'+(i===active?'active':'')+'">'+esc(l.name||l.title)+'</button>';}).join('');
if(cards)cards.innerHTML=locs.map(function(l,i){return '<article class="b-card'+(i===active?' active':'')+'"><p class="b-city">'+esc(l.city||'')+'</p><h3>'+esc(l.title||l.name)+'</h3><p class="b-copy">'+esc(l.copy||'')+'</p><p class="b-meta">'+esc(l.address||'')+'<br>'+esc(l.hours||'')+'</p><div class="b-actions"><a class="btn btn-gold btn-small" target="_blank" rel="noopener" href="https://wa.me/'+esc(l.whatsapp||c.whatsapp||'')+'">WhatsApp boutique</a><a class="btn-line" target="_blank" rel="noopener" href="'+esc(l.mapsUrl||'#')+'">Open in Maps</a></div></article>';}).join('');
if(sw)sw.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){select(Number(b.getAttribute('data-i')));});});
var foot=document.getElementById('footer-boutiques');
if(foot)foot.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){var v=a.getAttribute('data-b');var k=locs.findIndex(function(l){return l.label===v;});if(k>-1)select(k);});});
if(map){markers.forEach(function(m){map.removeLayer(m);});markers=[];locs.forEach(function(l,i){if(typeof l.lat!=='number')return;var m=L.marker([l.lat,l.lng]).addTo(map).bindPopup('<strong>'+esc(l.title||'')+'</strong>');m.on('click',function(){select(i);});markers.push(m);});if(locs[active])map.setView([locs[active].lat,locs[active].lng],12);}
}
function select(i){active=i;render();}
render();
if(mapEl&&window.L&&locs.length){map=L.map('boutique-map',{scrollWheelZoom:false}).setView([locs[0].lat,locs[0].lng],10);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'OpenStreetMap'}).addTo(map);render();}
window.LTE_selectBoutique=select;
var data=Array.isArray(window.LTE_RITUALS)?window.LTE_RITUALS:[];
var track=document.getElementById('ritual-track'),dots=document.getElementById('ritual-dots'),idx=0;
function paint(){if(!track)return;track.innerHTML=data.map(function(r){return '<article class="ritual-card"><img loading="lazy" src="'+esc(r.image)+'" alt="'+esc(r.title)+'"><p class="ritual-tag">'+esc(r.tag)+'</p><h3>'+esc(r.title)+'</h3><p>'+esc(r.copy)+'</p><p class="ritual-meta">'+esc(r.meta)+'</p></article>';}).join('');
if(dots){dots.innerHTML=data.map(function(_,i){return '<button type="button" data-i="'+i+'" class="'+(i===idx?'active':'')+'" aria-label="Ritual '+(i+1)+'"></button>';}).join('');dots.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){go(Number(b.getAttribute('data-i')));});});}}
function go(i){if(!data.length)return;idx=(i+data.length)%data.length;var el=track.children[idx];if(el)el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});if(dots)dots.querySelectorAll('button').forEach(function(b,j){b.classList.toggle('active',j===idx);});}
paint();
var p=document.getElementById('ritual-prev'),n=document.getElementById('ritual-next');
if(p)p.addEventListener('click',function(){go(idx-1);});if(n)n.addEventListener('click',function(){go(idx+1);});
var form=document.getElementById('reserve-form'),status=document.getElementById('r-status'),btn=document.getElementById('r-submit');
if(form)form.addEventListener('submit',function(e){e.preventDefault();if(!form.checkValidity()){status.textContent='Please add name, contact and boutique.';form.reportValidity();return;}btn.disabled=true;status.textContent='Sending to the maison…';setTimeout(function(){btn.disabled=false;status.textContent='Thank you — the maison will confirm shortly.';form.reset();},700);});
var fab=document.getElementById('concierge-fab'),panel=document.getElementById('concierge'),close=document.getElementById('concierge-close'),cf=document.getElementById('concierge-form'),ci=document.getElementById('concierge-input'),msgs=document.getElementById('concierge-msgs');
function setChat(o){if(!panel||!fab)return;panel.classList.toggle('open',o);panel.setAttribute('aria-hidden',String(!o));fab.setAttribute('aria-expanded',String(o));}
if(fab)fab.addEventListener('click',function(){setChat(!panel.classList.contains('open'));});
if(close)close.addEventListener('click',function(){setChat(false);});
function bubble(t,who){var d=document.createElement('div');d.className='msg '+(who==='out'?'msg-out':'msg-in');d.textContent=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
if(cf)cf.addEventListener('submit',function(e){e.preventDefault();var t=ci.value.trim();if(!t)return;bubble(t,'out');ci.value='';var num=(c.whatsappBot||c.whatsapp||'971500000000');setTimeout(function(){window.open('https://wa.me/'+num+'?text='+encodeURIComponent(t),'_blank','noopener');bubble('Opening WhatsApp to continue…','in');},600);});
if(window.location.href.toLowerCase().indexOf('devdetshow')>-1){var dn=document.getElementById('dev-note');if(dn)dn.hidden=false;}
})();

/* LTE lounge audio */
(function(){
var audio=document.getElementById('maison-audio'),btn=document.getElementById('sound-toggle');
if(!audio||!btn)return;
var fileAudio=(window.LTE_SETTINGS&&window.LTE_SETTINGS.audio)||{};
if(fileAudio.url){var s=audio.querySelector('source');if(s&&s.getAttribute('src')!==fileAudio.url){s.src=fileAudio.url;audio.load();}}
if(fileAudio.enabled===false){btn.style.display='none';return;}
var started=false,muted=false;
function label(){btn.innerHTML='<span aria-hidden="true">'+(audio.paused||audio.muted?'♪':'♫')+'</span> '+(audio.paused||audio.muted?'LOUNGE SOUND':'SOUND ON');btn.setAttribute('aria-pressed',String(!(audio.paused||audio.muted)));}
function play(){audio.muted=false;audio.play().then(function(){started=true;label();}).catch(function(){audio.muted=true;audio.play().then(label).catch(label);});}
play();
function unlock(){if(muted||started&&!audio.muted&&!audio.paused)return;if(!started||audio.muted){play();}window.removeEventListener('click',unlock);window.removeEventListener('keydown',unlock);}
window.addEventListener('click',unlock);window.addEventListener('keydown',unlock);
document.addEventListener('lte:entered',function(){if(!muted)play();});
btn.addEventListener('click',function(e){e.stopPropagation();if(audio.paused){muted=false;play();}else{audio.muted=!audio.muted;muted=audio.muted;if(!audio.muted)audio.play().catch(function(){});}label();});
label();
})();
