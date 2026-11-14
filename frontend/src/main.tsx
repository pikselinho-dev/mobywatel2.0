import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {definitions,ids,labels,initial,restore,transition,errors,canStart,readNotice} from './workflow.mjs';
import './style.css';

const KEY='mobywatel2-demo-v2';
type Id=keyof typeof definitions;
type Page='home'|'case'|'cases'|'alerts';
const title=(id:string)=>definitions[id as Id].title;
function load(){try{return restore(localStorage.getItem(KEY));}catch{return initial();}}
function App(){
 const [data,setData]=useState(load);
 const [page,setPage]=useState<Page>('home');
 const [active,setActive]=useState<Id>('birth');
 const [consent,setConsent]=useState(false);
 const [response,setResponse]=useState('');
 const [query,setQuery]=useState('');
 const [hint,setHint]=useState('');
 const [showErrors,setShowErrors]=useState(false);
 const [storageWarning,setStorageWarning]=useState(false);
 const c=data.cases[active], birth=data.cases.birth;
 const unread=data.notifications.filter(n=>!n.read).length;
 function save(s:ReturnType<typeof initial>){setData(s);try{localStorage.setItem(KEY,JSON.stringify(s));}catch{setStorageWarning(true);}}
 function act(event:string,payload:Record<string,unknown>={}){save(transition(data,active,event,payload));setConsent(false);}
 function open(id:Id,s=data){const next=transition(s,id,'start');if(!next.cases[id])return;save(next);setActive(id);setPage('case');setConsent(false);setResponse('');setShowErrors(false);}
 function reset(){save(initial());setPage('home');setActive('birth');setConsent(false);setQuery('');setHint('');setResponse('');setShowErrors(false);}
 function answerQuery(e:React.FormEvent){e.preventDefault();const q=query.toLowerCase();const id:Id|undefined=/800|świadczen/.test(q)?'benefit':/ubezpiec/.test(q)?'insurance':/przychod|lekarz|ikp|poz/.test(q)?'health':/urod|narodz|dzieck|noworod/.test(q)?'birth':undefined;
 if(id&&canStart(data,id)){setHint('');open(id);}else setHint(id?'Najpierw zakończ rejestrację urodzenia. Następnie rozpoczniesz tę sprawę.':'W tym demo obsługujemy narodziny dziecka, 800+, ubezpieczenie i wybór POZ.');}
 return <div className="app">
 <header><div><strong>mObywatel <span>2.0</span></strong><small>Jedno państwo. Jedna aplikacja.</small></div><button className="icon" onClick={()=>setPage('alerts')}>Powiadomienia {unread? '('+unread+')':''}</button></header>
 <aside className="demo">NIEOFICJALNY PROTOTYP • Dane fikcyjne. Nie wpisuj prawdziwych danych osobowych.</aside>
 {storageWarning&&<p role="status">Zapis lokalny niedostępny. Sprawy nie przetrwają odświeżenia.</p>}
 <main>
 {page==='home'&&<><p className="eyebrow">TWOJE PAŃSTWO</p><h1>Dzień dobry!</h1><p>Co chcesz dziś załatwić?</p>
 <section className="card"><h2>Asystent obywatelski</h2><p>Opisz potrzebę lub wybierz sprawę. Asystent demo przeprowadzi Cię przez pytania i dalsze formalności.</p>
 <form onSubmit={answerQuery}><label htmlFor="query">Czego potrzebujesz?</label><input id="query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Urodziło mi się dziecko"/><button disabled={!query.trim()}>Rozpocznij</button></form>{hint&&<p role="status">{hint}</p>}</section>
 <h2>Moje życie</h2><button className="tile" onClick={()=>open('birth')}><strong>Narodziny dziecka</strong><small>USC, świadczenia, ubezpieczenie i zdrowie</small><span>{labels[birth.stage]} →</span></button>
 {birth.stage==='completed'&&<Family data={data} open={open}/>}
 <h2>Usługi w przygotowaniu</h2><div className="tiles">{['Dokumenty i terminy','Podatki – US','Zdrowie – IKP (pozostałe usługi)','ZUS (pozostałe usługi)'].map(x=><div className="tile pending" key={x}><strong>{x}</strong><small>Planowany moduł</small></div>)}</div></>}
 {page==='case'&&c&&<><button className="back" onClick={()=>setPage('home')}>← Start</button><p className="eyebrow">{definitions[active].agency} · DEMO</p><h1>{title(active)}</h1><p className="status" role="status">{labels[c.stage]}</p>
 {active!=='birth'&&<p>Dziecko: {birth.values.name} {birth.values.surname} · identyfikator demonstracyjny, dane z zakończonej sprawy USC.</p>}
 {c.stage==='draft'&&<section className="card"><h2>1. Uzupełnij dane</h2><p>Używamy fikcyjnego profilu rodziny Nowak. To uproszczona procedura demonstracyjna.</p>
 <form onSubmit={e=>{e.preventDefault();setShowErrors(true);if(!errors(c).length)act('review');}}>
 {definitions[active].fields.map(f=><React.Fragment key={f.key}><label htmlFor={f.key}>{f.label}</label>{f.kind==='select'?<select id={f.key} value={c.values[f.key]} onChange={e=>act('edit',{key:f.key,value:e.target.value})}><option value="">Wybierz...</option>{f.options?.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>:<input id={f.key} maxLength={60} value={c.values[f.key]} onChange={e=>act('edit',{key:f.key,value:e.target.value})}/>}</React.Fragment>)}
 {active==='birth'&&c.values.birthCard==='waiting'&&<p role="status">Zapisaliśmy rozpoczętą sprawę. Poczekaj na kartę urodzenia. W demo możesz zasymulować jej przekazanie, wybierając opcję „Karta przekazana do USC”.</p>}
 {showErrors&&errors(c).length>0&&<div role="alert"><strong>Uzupełnij:</strong><ul>{errors(c).map((e,i)=><li key={i}>{e}</li>)}</ul></div>}
 <button>Sprawdź wniosek</button></form></section>}
 {c.stage==='review'&&<section className="card"><h2>2. Sprawdź i zatwierdź</h2><dl>{definitions[active].fields.map(f=><React.Fragment key={f.key}><dt>{f.label}</dt><dd>{f.options?.find(([v])=>v===c.values[f.key])?.[1]||c.values[f.key]}</dd></React.Fragment>)}<dt>Adresat</dt><dd>{definitions[active].agency} – demo</dd></dl><p>Nie jest to prawdziwy formularz urzędowy. Wysyłka i autoryzacja są symulowane.</p><label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Sprawdziłem dane i zatwierdzam wysyłkę demonstracyjną.</label><button disabled={!consent} onClick={()=>act('submit',{confirmed:consent})}>Zatwierdź i wyślij – demo</button><button className="secondary" onClick={()=>act('back')}>Popraw dane</button></section>}
 {!['draft','review'].includes(c.stage)&&<section className="card"><h2>3. Śledź sprawę</h2><p>Historia zdarzeń (symulacja urzędu)</p><ol className="timeline">{c.history.filter(h=>!['draft','review'].includes(h.stage)).map((h,i)=><li key={i}>{labels[h.stage]} <small>{new Date(h.at).toLocaleString('pl-PL')}</small></li>)}</ol>
 {c.stage==='submitted'&&<button onClick={()=>act('receive')}>Symuluj odebranie przez urząd</button>}
 {c.stage==='received'&&<button onClick={()=>act('inspect')}>Rozpocznij weryfikację – demo</button>}
 {c.stage==='in_review'&&<><button onClick={()=>act('finish')}>Symuluj pozytywne zakończenie</button>{!c.reason&&<button className="secondary" onClick={()=>act('request_info')}>Symuluj wezwanie do uzupełnienia</button>}</>}
 {c.stage==='needs_information'&&<><h3>Urząd potrzebuje dodatkowych informacji</h3><p>{c.reason}</p><label htmlFor="response">Odpowiedź (fikcyjna)</label><textarea id="response" rows={4} maxLength={500} value={response} onChange={e=>{setResponse(e.target.value);setConsent(false);}} placeholder="Potwierdzam dane wskazane we wniosku"/><label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Sprawdziłem odpowiedź i zatwierdzam jej wysłanie w demo.</label><button disabled={!consent||!response.trim()} onClick={()=>{act('respond',{response,confirmed:consent});setResponse('');}}>Wyślij uzupełnienie – demo</button></>}
 {c.result&&<><h3>{c.result.title}</h3><p>Numer sprawy: {c.result.reference}</p>{active==='birth'&&<><p>Dziecko: {c.result.child}</p><p>Identyfikator: {c.result.pesel}</p><p>{c.values.delivery==='digital'?'Odpis dostępny w formie demonstracyjnej poniżej.':'Odbiór osobisty w przykładowym USC. W rzeczywistej usłudze aplikacja pokaże właściwy adres i wymagania.'}</p></>}
 <button className="secondary" onClick={()=>{const blob=new Blob(['NIEOFICJALNE DEMO — bez mocy urzędowej\n'+c.result.title+'\nNumer: '+c.result.reference+'\n'+(active==='birth'?'Dziecko: '+c.result.child+'\nIdentyfikator: '+c.result.pesel:'')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='potwierdzenie-demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Pobierz przykładowe potwierdzenie</button>
 {c.stage==='collection_ready'&&<><label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Potwierdzam odbiór w scenariuszu demonstracyjnym.</label><button disabled={!consent} onClick={()=>act('collect',{confirmed:consent})}>Potwierdź odbiór – demo</button></>}
 <button className="secondary" onClick={()=>setPage('alerts')}>Zobacz powiadomienia</button></>}
 </section>}
 {active==='birth'&&c.stage==='completed'&&<Family data={data} open={open}/>}
 </>}
 {page==='cases'&&<><h1>Moje sprawy</h1>{ids.filter(id=>data.cases[id]).map(id=><button className="tile" key={id} onClick={()=>open(id as Id)}><strong>{title(id)}</strong><small>{labels[data.cases[id].stage]}</small><span>Otwórz →</span></button>)}</>}
 {page==='alerts'&&<><h1>Powiadomienia</h1>{data.notifications.length?data.notifications.map(n=><button className="tile" key={n.key} onClick={()=>open(n.id as Id,readNotice(data,n.key))}><strong>{n.read?'Przeczytane':'Nowe'} · {title(n.id)}</strong><small>{n.message}</small></button>):<p>Brak powiadomień.</p>}<p className="note">Powiadomienia w aplikacji, bez rzeczywistego Web Push.</p></>}
 </main><nav aria-label="Główna nawigacja">{([['home','Start'],['cases','Sprawy'],['alerts','Powiadomienia']] as const).map(([p,t])=><button key={p} aria-current={page===p?'page':undefined} onClick={()=>setPage(p)}>{t}</button>)}</nav><footer><button className="back" onClick={()=>{if(window.confirm('Usunąć dane demonstracyjne i rozpocząć od nowa?'))reset();}}>Zresetuj demo</button></footer></div>;
}
function Family({data,open}:{data:ReturnType<typeof initial>;open:(id:Id)=>void}){
 return <section className="card"><h2>Co dalej po narodzinach?</h2><p>Rejestracja zakończona. Każda kolejna sprawa korzysta z tego samego profilu dziecka, ale wymaga osobnego zatwierdzenia.</p>{(['benefit','insurance','health'] as const).map(id=><button className="tile secondary" key={id} onClick={()=>open(id)}><strong>{title(id)}</strong><small>{data.cases[id]?labels[data.cases[id].stage]:'Rozpocznij sprawę'} →</small></button>)}</section>;
}
createRoot(document.getElementById('root')!).render(<App/>);
