/* LTE admin: rituals + settings */
var EVENTS_KEY='lte_rituals_v1',SESSION_KEY='lte_admin_ok';
var ADMIN_HASH='03419798f23010136167aa9b8b74cbdde18099c101aa47f0fc3bb48f43e5e73c';
var DEFAULT_EVENTS=[
{image:'https://images.pexels.com/photos/33731258/pexels-photo-33731258.jpeg?auto=compress&cs=tinysrgb&w=900',category:'BLIND FLIGHT NIGHT',title:'Cuba vs World, Unbanded',copy:'Two cigars, labels off.',date:'MONTHLY · BY RESERVATION'},
{image:'https://images.pexels.com/photos/28539666/pexels-photo-28539666.jpeg?auto=compress&cs=tinysrgb&w=900',category:'POUR AND SMOKE',title:'The Pairing Atelier',copy:'Rum, bourbon, sherry and coffee.',date:'WEEKLY · SMALL TABLES'},
{image:'https://images.pexels.com/photos/15161546/pexels-photo-15161546.jpeg?auto=compress&cs=tinysrgb&w=900',category:'HOUSE TABLE',title:'Golden Hour, Slow Hour',copy:'Shared tables, one featured pour.',date:'FRIDAYS · OPEN INVITATION'}
];
function $(s){return document.querySelector(s);}
var editingIndex=null,fileEvents=null,statusTimer=null;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

async function sha256(t){var b=new TextEncoder().encode(t);var d=await crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(d)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');}
function toast(m){var t=$('#status-toast');t.textContent=m;t.classList.add('show');clearTimeout(statusTimer);statusTimer=setTimeout(function(){t.classList.remove('show');},2400);}
function loadLocal(){try{var r=localStorage.getItem(EVENTS_KEY);if(!r)return null;var p=JSON.parse(r);return p&&Array.isArray(p.events)?p.events:null;}catch(e){return null;}}
async function loadFile(){try{var r=await fetch('../js/rituals-data.js',{cache:'no-store'});if(!r.ok)return null;var t=await r.text();var m=t.match(/window\.LTE_RITUALS\s*=\s*(\[[\s\S]*?\])\s*;?/);if(!m)return null;var p=JSON.parse(m[1]);return Array.isArray(p)?p:null;}catch(e){return null;}}
function current(){if(fileEvents&&fileEvents.length)return fileEvents.slice();var s=loadLocal();return s&&s.length?s:DEFAULT_EVENTS.slice();}
function persist(ev){localStorage.setItem(EVENTS_KEY,JSON.stringify({events:ev}));fileEvents=ev.slice();}
$('#login-form').addEventListener('submit',async function(e){e.preventDefault();var v=$('#password').value;try{var h=await sha256(v);if(h===ADMIN_HASH){sessionStorage.setItem(SESSION_KEY,'1');openAdmin();}else{$('#login-error').textContent='Incorrect password.';}}catch(err){$('#login-error').textContent='Login unavailable.';}});
async function openAdmin(){$('#login-view').style.display='none';$('#admin-view').hidden=false;fileEvents=await loadFile();if(!fileEvents)fileEvents=current();renderList();renderSettings();updateCount();}
function updateCount(){var n=current().length;$('#events-count').textContent=n+' ritual(s) in the maison';}

function renderList(){var ev=current();var box=$('#event-list');box.innerHTML=ev.map(function(it,i){return '<div class="event-item"><img loading="lazy" src="'+esc(it.image)+'"><div><strong>'+esc(it.title)+'</strong><div>'+esc(it.category||'')+' · '+esc(it.date||'')+'</div><p>'+esc(it.copy||'')+'</p></div><div><button data-edit="'+i+'">Edit</button> <button data-del="'+i+'">Delete</button> <button data-up="'+i+'">Up</button> <button data-down="'+i+'">Down</button></div></div>';}).join('')||'<p>No rituals yet.</p>';
box.querySelectorAll('[data-edit]').forEach(function(b){b.addEventListener('click',function(){var i=Number(b.getAttribute('data-edit'));var it=current()[i];editingIndex=i;$('#form-title').textContent='Edit ritual';$('#f-image').value=it.image||'';$('#f-category').value=it.category||'';$('#f-date').value=it.date||'';$('#f-title').value=it.title||'';$('#f-copy').value=it.copy||'';$('#cancel-edit-btn').hidden=false;preview();});});
box.querySelectorAll('[data-del]').forEach(function(b){b.addEventListener('click',function(){var ev=current();ev.splice(Number(b.getAttribute('data-del')),1);persist(ev);renderList();updateCount();toast('Ritual deleted');});});
box.querySelectorAll('[data-up]').forEach(function(b){b.addEventListener('click',function(){var ev=current();var i=Number(b.getAttribute('data-up'));if(i>0){var t=ev[i-1];ev[i-1]=ev[i];ev[i]=t;persist(ev);renderList();}});});
box.querySelectorAll('[data-down]').forEach(function(b){b.addEventListener('click',function(){var ev=current();var i=Number(b.getAttribute('data-down'));if(i<ev.length-1){var t=ev[i+1];ev[i+1]=ev[i];ev[i]=t;persist(ev);renderList();}});});
}
function preview(){var img=$('#image-preview');var v=$('#f-image').value.trim();if(v){img.src=v;img.hidden=false;}else{img.hidden=true;}}
$('#f-image').addEventListener('input',preview);
$('#event-form').addEventListener('submit',function(e){e.preventDefault();var item={image:$('#f-image').value.trim(),category:$('#f-category').value.trim(),title:$('#f-title').value.trim(),copy:$('#f-copy').value.trim(),date:$('#f-date').value.trim()};if(!item.image||!item.title)return;var ev=current();if(editingIndex==null)ev.push(item);else ev[editingIndex]=item;editingIndex=null;$('#form-title').textContent='Add ritual';$('#cancel-edit-btn').hidden=true;e.target.reset();preview();persist(ev);renderList();updateCount();toast('Ritual saved locally');});
$('#cancel-edit-btn').addEventListener('click',function(){editingIndex=null;$('#form-title').textContent='Add ritual';$('#event-form').reset();this.hidden=true;preview();});
$('#export-btn').addEventListener('click',async function(){var s='window.LTE_RITUALS = '+JSON.stringify(current().map(function(e){return {tag:e.category,title:e.title,copy:e.copy,meta:e.date,image:e.image};}),null,2)+';\n';try{await navigator.clipboard.writeText(s);toast('Copied — paste into js/rituals-data.js');}catch(e){toast('Copy blocked');}});
$('#restore-btn').addEventListener('click',function(){persist(DEFAULT_EVENTS.slice());editingIndex=null;renderList();updateCount();toast('Defaults restored');});
$('#logout-btn').addEventListener('click',function(){sessionStorage.removeItem(SESSION_KEY);location.reload();});

var SETTINGS_KEY='lte_settings_v1';
function defaults(){return (window.LTE_DEFAULTS||{contact:{email:'concierge@letabacexclusivo.com',whatsapp:'971500000000',whatsappBot:'971500000000',instagram:'https://instagram.com/letabacexclusivo'},audio:{url:'',enabled:true},locations:[]});}
async function fileSettings(){try{var r=await fetch('../js/site-settings.js',{cache:'no-store'});if(!r.ok)return null;var t=await r.text();var i=t.indexOf('window.LTE_SETTINGS =');if(i<0)return null;var p=JSON.parse(t.slice(i+'window.LTE_SETTINGS ='.length).replace(/;\s*$/,''));return p;}catch(e){return null;}}
function saved(){try{var r=localStorage.getItem(SETTINGS_KEY);if(!r)return null;var p=JSON.parse(r);return p&&p.settings?p.settings:null;}catch(e){return null;}}
async function renderSettings(){var f=await fileSettings();var s=saved()||f||defaults();window.LTE_DEFAULTS=f||defaults();
var box=$('#settings-forms');var c=s.contact||{},a=s.audio||{};
box.innerHTML='<label>Contact email<input id="s-email" value="'+esc(c.email||'')+'"></label><label>WhatsApp main<input id="s-wa" value="'+esc(c.whatsapp||'')+'"></label><label>WhatsApp concierge<input id="s-wabot" value="'+esc(c.whatsappBot||'')+'"></label><label>Instagram URL<input id="s-ig" value="'+esc(c.instagram||'')+'"></label><label>Audio URL<input id="s-audio" value="'+esc(a.url||'')+'"></label><label>Audio mode<select id="s-audio-on"><option value="on">ON</option><option value="off">OFF</option></select></label><div id="loc-box"></div>';
$('#s-audio-on').value=(a.enabled===false)?'off':'on';
var lb=$('#loc-box');lb.innerHTML='<h3>Boutiques ('+(s.locations||[]).length+')</h3>'+(s.locations||[]).map(function(l,i){return '<div class="event-item"><strong>'+esc(l.title||l.name||('Boutique '+(i+1)))+'</strong><span>'+esc(l.label||'')+'</span><label>Name<input data-loc="'+i+'" data-k="name" value="'+esc(l.name||'')+'"></label><label>Title<input data-loc="'+i+'" data-k="title" value="'+esc(l.title||'')+'"></label><label>Label<input data-loc="'+i+'" data-k="label" value="'+esc(l.label||'')+'"></label><label>City<input data-loc="'+i+'" data-k="city" value="'+esc(l.city||'')+'"></label><label>WhatsApp<input data-loc="'+i+'" data-k="whatsapp" value="'+esc(l.whatsapp||'')+'"></label><label>Maps URL<input data-loc="'+i+'" data-k="mapsUrl" value="'+esc(l.mapsUrl||'')+'"></label><label>Address<input data-loc="'+i+'" data-k="address" value="'+esc(l.address||'')+'"></label><label>Hours<input data-loc="'+i+'" data-k="hours" value="'+esc(l.hours||'')+'"></label></div>';}).join('');
box.dataset.snapshot=JSON.stringify(s);
}
function collect(){var s=JSON.parse($('#settings-forms').dataset.snapshot||'{}');s.contact={email:$('#s-email').value.trim(),whatsapp:$('#s-wa').value.trim(),whatsappBot:$('#s-wabot').value.trim(),instagram:$('#s-ig').value.trim()};s.audio={url:$('#s-audio').value.trim(),enabled:$('#s-audio-on').value!=='off'};
document.querySelectorAll('[data-loc]').forEach(function(inp){var i=Number(inp.getAttribute('data-loc'));var k=inp.getAttribute('data-k');s.locations[i][k]=inp.value.trim();if((k==='lat'||k==='lng')&&s.locations[i][k]!=='')s.locations[i][k]=Number(s.locations[i][k]);});return s;}
$('#settings-save-btn').addEventListener('click',function(){var s=collect();localStorage.setItem(SETTINGS_KEY,JSON.stringify({settings:s}));$('#settings-forms').dataset.snapshot=JSON.stringify(s);toast('Settings saved locally');});
$('#settings-export-btn').addEventListener('click',async function(){var s='window.LTE_SETTINGS = '+JSON.stringify(collect(),null,2)+';\n';try{await navigator.clipboard.writeText(s);toast('Copied — paste into js/site-settings.js');}catch(e){toast('Copy blocked');}});
$('#settings-restore-btn').addEventListener('click',async function(){localStorage.removeItem(SETTINGS_KEY);await renderSettings();toast('Defaults restored');});
document.querySelectorAll('.tab-btn').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('.tab-btn').forEach(function(x){x.classList.remove('active');});b.classList.add('active');var p=b.getAttribute('data-panel');$('#panel-events').hidden=(p!=='events');$('#panel-settings').hidden=(p!=='settings');});});
try{if(sessionStorage.getItem(SESSION_KEY)==='1')openAdmin();}catch(e){}
