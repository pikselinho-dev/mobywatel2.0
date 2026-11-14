import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

type Stage = 'draft'|'review'|'submitted'|'received'|'completed';
type Birth = {name:string; surname:string; delivery:'digital'|'office'; stage:Stage};
type Demo = {birth:Birth; notifications:string[]};
const KEY='mobywatel2-demo-v1';
const initial=():Demo=>({birth:{name:'',surname:'Nowak',delivery:'digital',stage:'draft'},notifications:[]});
function load():Demo {
  try {const x=JSON.parse(localStorage.getItem(KEY)||'null');
    if(x && typeof x.birth?.name==='string' && typeof x.birth?.surname==='string' &&
      ['digital','office'].includes(x.birth.delivery) &&
      ['draft','review','submitted','received','completed'].includes(x.birth.stage) &&
      Array.isArray(x.notifications) && x.notifications.every((v:unknown)=>typeof v==='string')) return x;
  }catch{} return initial();
}
const labels:Record<Stage,string>={draft:'W przygotowaniu',review:'Do zatwierdzenia',submitted:'Wysłano do USC',received:'Weryfikacja w USC',completed:'Dokument gotowy'};
function App(){
  const [data,setData]=useState<Demo>(load);
  const [page,setPage]=useState<'home'|'birth'|'cases'|'alerts'>('home');
  const [consent,setConsent]=useState(false);
  const [query,setQuery]=useState('');
  const [hint,setHint]=useState('');
  const [storageWarning,setStorageWarning]=useState(false);
  const birth=data.birth;
  function save(next:Demo){setData(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{setStorageWarning(true);}}
  function patch(next:Partial<Birth>){save({...data,birth:{...birth,...next}});}
  function advance(){
    if(birth.stage==='submitted') patch({stage:'received'});
    if(birth.stage==='received') save({...data,birth:{...birth,stage:'completed'},notifications:['Twój dokument jest gotowy. Otwórz sprawę, aby zobaczyć szczegóły.',...data.notifications]});
  }
  function openBirth(){setPage('birth');setConsent(false);}
  function reset(){save(initial());setConsent(false);setPage('home');setHint('');setQuery('');}
  return <div className="app">
    <header><div><strong>mObywatel <span>2.0</span></strong><small>Jedno państwo. Jedna aplikacja.</small></div><button className="icon" onClick={()=>setPage('alerts')} aria-label="Powiadomienia">Powiadomienia {data.notifications.length>0?'('+data.notifications.length+')':''}</button></header>
    <aside className="demo">NIEOFICJALNY PROTOTYP • Dane fikcyjne. Nie wpisuj prawdziwych danych osobowych.</aside>
    {storageWarning&&<p role="status">Zapis lokalny niedostępny. Sprawa nie przetrwa odświeżenia.</p>}
    <main>
    {page==='home'&&<><p className="eyebrow">TWOJE PAŃSTWO</p><h1>Dzień dobry!</h1><p>Co chcesz dziś załatwić?</p>
      <section className="card"><h2>Asystent obywatelski</h2><p>Opisz swoją sprawę lub wybierz gotowy scenariusz. Na razie obsługujemy demonstrację narodzin dziecka.</p><form onSubmit={e=>{e.preventDefault();if(/urod|narodz|dzieck|noworod/i.test(query))openBirth();else setHint('W tej wersji możesz przejść sprawę narodzin dziecka. Pozostałe scenariusze są w przygotowaniu.');}}><label htmlFor="query">Czego potrzebujesz?</label><input id="query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Urodziło mi się dziecko"/><button disabled={!query.trim()}>Rozpocznij</button></form>{hint&&<p role="status">{hint}</p>}</section>
      <h2>Twoje sprawy życiowe</h2><button className="tile" onClick={openBirth}><strong>Narodziny dziecka</strong><small>Od zgłoszenia do gotowego dokumentu</small><span>{labels[birth.stage]} →</span></button>
      <h2>Usługi w przygotowaniu</h2><div className="tiles">{['Dokumenty i terminy','Podatki – US','Zdrowie – IKP','ZUS i rodzina'].map(x=><div className="tile pending" key={x}><strong>{x}</strong><small>Planowany moduł</small></div>)}</div></>}
    {page==='birth'&&<><button className="back" onClick={()=>setPage('home')}>← Start</button><p className="eyebrow">URZĄD STANU CYWILNEGO · DEMO</p><h1>Narodziny dziecka</h1><p className="status">{labels[birth.stage]}</p>
      {birth.stage==='draft'&&<section className="card"><h2>1. Uzupełnij dane</h2><p>Używamy przykładowego profilu rodziny Nowak. Wybierz fikcyjne imię i sposób odbioru.</p><form onSubmit={e=>{e.preventDefault();if(birth.name.trim()&&birth.surname.trim()){patch({name:birth.name.trim(),surname:birth.surname.trim(),stage:'review'});setConsent(false);}}}><label htmlFor="name">Imię dziecka (fikcyjne)</label><input id="name" required maxLength={60} value={birth.name} onChange={e=>patch({name:e.target.value})}/><label htmlFor="surname">Nazwisko dziecka (fikcyjne)</label><input id="surname" required maxLength={60} value={birth.surname} onChange={e=>patch({surname:e.target.value})}/><label htmlFor="delivery">Sposób odbioru odpisu</label><select id="delivery" value={birth.delivery} onChange={e=>patch({delivery:e.target.value as Birth['delivery']})}><option value="digital">Elektronicznie</option><option value="office">W urzędzie</option></select><button disabled={!birth.name.trim()||!birth.surname.trim()}>Sprawdź wniosek</button></form></section>}
      {birth.stage==='review'&&<section className="card"><h2>2. Sprawdź i zatwierdź</h2><dl><dt>Dziecko</dt><dd>{birth.name} {birth.surname}</dd><dt>Odbiór</dt><dd>{birth.delivery==='digital'?'Elektronicznie':'W urzędzie'}</dd><dt>Adresat</dt><dd>Przykładowy USC (demo)</dd></dl><p>To uproszczony formularz demonstracyjny, nie urzędowy wniosek.</p><label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Sprawdziłem dane i zatwierdzam symulację.</label><button disabled={!consent} onClick={()=>{patch({stage:'submitted'});setConsent(false);}}>Zatwierdź i wyślij – demo</button><button className="secondary" onClick={()=>{patch({stage:'draft'});setConsent(false);}}>Popraw dane</button></section>}
      {['submitted','received','completed'].includes(birth.stage)&&<section className="card"><h2>3. Śledź sprawę</h2><ol className="timeline"><li>✓ Zgłoszenie wysłane – symulacja</li><li>{birth.stage==='submitted'?'○':'✓'} Odebrano i zweryfikowano – demo</li><li>{birth.stage==='completed'?'✓':'○'} Dokument gotowy – demo</li></ol>{birth.stage!=='completed'?<><p>Przycisk poniżej symuluje zdarzenie z urzędu. Nie ma połączenia z rejestrem.</p><button onClick={advance}>Symuluj kolejny etap</button></>:<><h3>Odpis aktu urodzenia gotowy</h3><p>{birth.delivery==='digital'?'W docelowym systemie dokument byłby dostępny elektronicznie.':'W docelowym systemie zobaczysz dane urzędu i warunki odbioru.'}</p><p>Powiadomienie dodano do skrzynki demonstracyjnej.</p><button onClick={()=>setPage('alerts')}>Zobacz powiadomienie</button><p className="note">Dalsze kroki: 800+, ubezpieczenie i IKP – planowane.</p></>}</section>}
    </>}
    {page==='cases'&&<><h1>Moje sprawy</h1><button className="tile" onClick={openBirth}><strong>Narodziny dziecka</strong><small>{labels[birth.stage]}</small><span>Otwórz →</span></button></>}
    {page==='alerts'&&<><h1>Powiadomienia</h1>{data.notifications.length?data.notifications.map((n,i)=><button className="tile" key={i} onClick={openBirth}>{n}</button>):<p>Brak nowych powiadomień.</p>}<p className="note">To skrzynka w aplikacji, nie rzeczywisty Web Push.</p></>}
    </main><nav aria-label="Główna nawigacja">{([['home','Start'],['cases','Sprawy'],['alerts','Powiadomienia']] as const).map(([p,t])=><button key={p} aria-current={page===p?'page':undefined} onClick={()=>setPage(p)}>{t}</button>)}</nav><footer><button className="back" onClick={()=>{if(window.confirm('Usunąć fikcyjne dane i rozpocząć demo od nowa?'))reset();}}>Zresetuj demo</button></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
