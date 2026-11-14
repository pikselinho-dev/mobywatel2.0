// Deterministyczny silnik demonstracyjny; bez połączeń sieciowych.
export const definitions = {
  identity: {title:'Wymiana dowodu osobistego', agency:'Urząd gminy', fields:[
    {key:'applicant',label:'Imię i nazwisko (profil demo)',initial:'Anna Nowak',kind:'text'},
    {key:'reason',label:'Powód wymiany',initial:'expiry',kind:'select',options:[['expiry','Upływ ważności dokumentu']]},
    {key:'office',label:'Urząd złożenia wniosku i odbioru',initial:'',kind:'select',options:[['demo-north','Urząd Demo Północ'],['demo-south','Urząd Demo Południe']]},
    {key:'photo',label:'Aktualne zdjęcie (bez przesyłania pliku)',initial:'',kind:'select',options:[['demo-photo','Dołącz przykładowe zdjęcie – symulacja']]},
    {key:'signature',label:'Certyfikat podpisu osobistego',initial:'',kind:'select',options:[['yes','Chcę'],['no','Nie chcę']]},
    {key:'contact',label:'Kontakt (fikcyjny)',initial:'',kind:'select',options:[['demo-email','Użyj przykładowego adresu e-mail']]}
  ]},
  birth: {title:'Rejestracja urodzenia', agency:'USC', fields:[
    {key:'name',label:'Imię dziecka (fikcyjne)',initial:'',kind:'text'},
    {key:'surname',label:'Nazwisko dziecka (fikcyjne)',initial:'Nowak',kind:'text'},
    {key:'birthCard',label:'Karta urodzenia (dane demo)',initial:'',kind:'select',options:[['confirmed','Karta przekazana do USC'],['waiting','Karta jeszcze niedostępna']]},
    {key:'address',label:'Zameldowanie (przykładowe adresy)',initial:'',kind:'select',options:[['mother','Adres matki'],['father','Adres ojca']]},
    {key:'delivery',label:'Sposób odbioru odpisu',initial:'digital',kind:'select',options:[['digital','Elektronicznie'],['office','W urzędzie']]}
  ]},
  benefit: {title:'Świadczenie 800+',agency:'ZUS',fields:[
    {key:'applicant',label:'Wnioskodawca (demo)',initial:'Anna Nowak',kind:'text'},
    {key:'account',label:'Rachunek do wypłaty (fikcyjny wybór)',initial:'',kind:'select',options:[['demo-account','Przykładowy rachunek demo']]},
    {key:'care',label:'Opieka nad dzieckiem (uproszczone demo)',initial:'',kind:'select',options:[['confirmed','Potwierdzam opiekę w scenariuszu demo']]}
  ]},
  insurance: {title:'Zgłoszenie dziecka do ubezpieczenia',agency:'Płatnik / ZUS',fields:[
    {key:'route',label:'Sposób zgłoszenia (demo)',initial:'',kind:'select',options:[['employer','Przez pracodawcę – płatnika składek'],['self','Samodzielnie jako płatnik składek']]}
  ]},
  health: {title:'Zdrowie dziecka – wybór POZ',agency:'IKP / NFZ',fields:[
    {key:'clinic',label:'Przykładowa przychodnia',initial:'',kind:'select',options:[['north','Przychodnia Demo Północ'],['south','Przychodnia Demo Południe']]},
    {key:'doctor',label:'Przykładowy lekarz',initial:'',kind:'select',options:[['demo-doctor','Lekarz rodzinny Demo']]}
  ]}
};
export const ids=Object.keys(definitions);
export const labels={draft:'W przygotowaniu',review:'Do zatwierdzenia',submitted:'Wysłano',received:'Odebrano',in_review:'Weryfikacja',needs_information:'Wymaga uzupełnienia',collection_ready:'Gotowe do odbioru',completed:'Zakończono',visit_required:'Wymagana wizyta w urzędzie',expired:'Wniosek pozostawiony bez rozpoznania'};
export const freshCase=(id)=>({id,stage:'draft',values:Object.fromEntries(definitions[id].fields.map(f=>[f.key,f.initial])),history:[],reason:'',response:'',result:null});
const DAY=86400000;
const EPOCH=Date.UTC(2026,10,14);
export const demoDate=(day)=>new Date(EPOCH+day*DAY).toISOString().slice(0,10);
const dateToDay=(date)=>Math.round((Date.parse(date+'T00:00:00Z')-EPOCH)/DAY);
export const initialDeadline=()=>({day:0,expiryDay:100,reminders:true,autoDraft:true,emitted:[],renewed:false,visitDue:null});
export const initial=()=>({version:2,cases:{birth:freshCase('birth')},notifications:[],deadline:initialDeadline()});
export const daysLeft=(s)=>s.deadline.expiryDay-s.deadline.day;
const addNotice=(s,key,message)=>({...s,notifications:[{id:'identity',message,key,at:demoDate(s.deadline.day)+'T12:00:00Z',read:false},...s.notifications]});
export function evaluateDeadlines(s){
 let d=s.deadline, next=s;
 const c=s.cases.identity;
 if(['submitted','visit_required'].includes(c?.stage)&&d.visitDue!==null&&d.day>d.visitDue){
   next={...s,cases:{...s.cases,identity:{...c,stage:'expired',history:[...c.history,{stage:'expired',at:demoDate(d.day)+'T12:00:00Z'}]}}};
   next=addNotice(next,'identity-visit-expired','Minął termin wizyty. Wniosek demo nie zostanie rozpoznany. Możesz przygotować nowy.');
 }
 if(d.renewed)return next;
 const left=daysLeft(next);
 if(d.autoDraft&&left<=60&&!next.cases.identity){
   next={...next,cases:{...next.cases,identity:freshCase('identity')}};
   if(d.reminders)next=addNotice(next,'identity-auto-draft','Przygotowaliśmy roboczy wniosek o nowy dowód. Sprawdź dane i uzupełnij brakujące informacje.');
 }
 const reached=[90,60,30,7,0].filter(t=>left<=t&&!d.emitted.includes(t));
 if(d.reminders&&reached.length){
   const t=reached[reached.length-1];
   const message=left<=0?'Termin ważności dowodu upłynął lub przypada dziś (demo).': 'Do końca ważności dowodu pozostało '+left+' dni.'+(t<=30?' Sprawdź, czy wymiana jest w toku.':' Zaplanuj wymianę.');
   next=addNotice(next,'identity-reminder-'+t,message);
   next={...next,deadline:{...d,emitted:[...d.emitted,...reached]}};
 }
 return next;
}
export function changeDeadline(s,change){
 const d=s.deadline;
 const day=Number.isInteger(change.advance)&&change.advance>0&&change.advance<=100?d.day+change.advance:d.day;
 const next={...s,deadline:{...d,day,reminders:typeof change.reminders==='boolean'?change.reminders:d.reminders,autoDraft:typeof change.autoDraft==='boolean'?change.autoDraft:d.autoDraft}};
 return evaluateDeadlines(next);
}

const validField=(f,v)=>typeof v==='string'&& (f.kind==='text'?v.trim().length>0&&v.length<=60:f.options.some(([key])=>key===v));
export function errors(c){
  const out=definitions[c.id].fields.filter(f=>!validField(f,c.values[f.key])).map(f=>f.label);
  if(c.id==='birth'&&c.values.birthCard!=='confirmed')out.push('Karta urodzenia musi być dostępna w USC (symulacja).');
  return out;
}
export function canStart(s,id){
  return ids.includes(id)&&(id==='birth'||id==='identity'||['completed','collection_ready'].includes(s.cases.birth?.stage));
}
export function transition(s,id,event,payload={}){
  if(!canStart(s,id))return s;
  if(event==='restart'&&id==='identity'&&s.cases.identity?.stage==='expired')return {...s,cases:{...s.cases,identity:freshCase('identity')},deadline:{...s.deadline,visitDue:null},notifications:s.notifications.filter(n=>!['identity-visit-expired','identity-visit_required','identity-collection_ready','identity-completed','identity-needs_information'].includes(n.key))};
  if(event==='start'){
    if(s.cases[id])return s;
    return {...s,cases:{...s.cases,[id]:freshCase(id)}};
  }
  const c=s.cases[id]; if(!c)return s;
  let next=null, notice='';
  const stage=(value)=>({...c,stage:value,history:[...c.history,{stage:value,at:demoDate(s.deadline.day)+'T12:00:00Z'}]});
  if(event==='edit'&&c.stage==='draft'){
    const f=definitions[id].fields.find(f=>f.key===payload.key);
    if(f&&typeof payload.value==='string'&&payload.value.length<=60&&(f.kind==='text'||payload.value===''||f.options.some(([v])=>v===payload.value)))next={...c,values:{...c.values,[f.key]:payload.value}};
  }
  if(event==='review'&&c.stage==='draft'&&!errors(c).length)next=stage('review');
  if(event==='back'&&c.stage==='review')next=stage('draft');
  if(event==='submit'&&c.stage==='review'&&payload.confirmed===true&&!errors(c).length)next=stage('submitted');
  if(event==='receive'&&c.stage==='submitted')next=stage(id==='identity'?'visit_required':'received');
  if(event==='visit'&&id==='identity'&&c.stage==='visit_required'&&payload.confirmed===true&&s.deadline.day<=s.deadline.visitDue)next=stage('received');
  if(event==='inspect'&&c.stage==='received')next=stage('in_review');
  if(event==='request_info'&&c.stage==='in_review'&&!c.reason){
    next={...stage('needs_information'),reason:'Urząd prosi o potwierdzenie danych z wniosku (fikcyjne wezwanie).',response:''};
    notice='Sprawa wymaga uzupełnienia. Sprawdź wezwanie i przygotuj odpowiedź.';
  }
  if(event==='respond'&&c.stage==='needs_information'&&payload.confirmed===true&&typeof payload.response==='string'&&payload.response.trim().length>0&&payload.response.length<=500)
    next={...stage('in_review'),response:payload.response.trim()};
  if(event==='finish'&&c.stage==='in_review'){
    const birth=id==='birth';
    next={...stage(id==='identity'||(birth&&c.values.delivery==='office')?'collection_ready':'completed'),result:birth?{title:'Odpis aktu urodzenia – DEMO',reference:'USC-DEMO-001',child:c.values.name+' '+c.values.surname,pesel:'DEMO-NIE-JEST-PESEL',delivery:c.values.delivery}: {title:definitions[id].title+' – potwierdzenie demo',reference:id.toUpperCase()+'-DEMO-001',...(id==='identity'?{issuedDay:s.deadline.day}:{})}};
    notice=birth||id==='identity'?'Dokument jest gotowy. Sprawdź sposób odbioru.':'Sprawa została zakończona (symulacja).';
  }
  if(event==='collect'&&c.stage==='collection_ready'&&payload.confirmed===true){
    next=stage('completed');notice='Potwierdzono odbiór dokumentu (symulacja).';
  }
  if(!next)return s;
  let deadline=s.deadline;
  if(id==='identity'&&event==='submit')deadline={...deadline,visitDue:deadline.day+30};
  if(id==='identity'&&event==='receive')notice='Wniosek przyjęto. Uzupełnij odciski palców i podpis w urzędzie w ciągu 30 dni od wysłania.';
  if(id==='identity'&&event==='collect'){
    const date=new Date(EPOCH+c.result.issuedDay*DAY);date.setUTCFullYear(date.getUTCFullYear()+10);
    deadline={...deadline,expiryDay:dateToDay(date.toISOString().slice(0,10)),renewed:true,visitDue:null,emitted:[]};
  }
  return {...s,deadline,cases:{...s.cases,[id]:next},notifications:notice?[{id, message:notice, key:id+'-'+next.stage,at:demoDate(deadline.day)+'T12:00:00Z',read:false},...s.notifications]:s.notifications};
}
export function readNotice(s,key){
  return {...s,notifications:s.notifications.map(n=>n.key===key?{...n,read:true}:n)};
}
export function restore(raw){
  try {
    const s=JSON.parse(raw);
    if(s?.version!==2||!s.cases||!Array.isArray(s.notifications)||!s.cases.birth)return initial();
    if(!s.deadline)s.deadline=initialDeadline();
    const d=s.deadline;
    if(!Number.isInteger(d.day)||d.day<0||!Number.isInteger(d.expiryDay)||typeof d.reminders!=='boolean'||typeof d.autoDraft!=='boolean'||typeof d.renewed!=='boolean'||!Array.isArray(d.emitted)||!d.emitted.every(t=>[90,60,30,7,0].includes(t))||!(d.visitDue===null||Number.isInteger(d.visitDue)))return initial();
    for(const [id,c] of Object.entries(s.cases)){
      if(!ids.includes(id)||c.id!==id||!Object.hasOwn(labels,c.stage)||!c.values||!Array.isArray(c.history)||typeof c.reason!=='string'||typeof c.response!=='string')return initial();
      if(!c.history.every(h=>h&&Object.hasOwn(labels,h.stage)&&typeof h.at==='string'&&Number.isFinite(Date.parse(h.at))))return initial();
      if(!definitions[id].fields.every(f=>typeof c.values[f.key]==='string'&&c.values[f.key].length<=60&&(f.kind==='text'||c.values[f.key]===''||f.options.some(([v])=>v===c.values[f.key]))))return initial();
      if(c.stage!=='draft'&&errors(c).length)return initial();
      if(['completed','collection_ready'].includes(c.stage)&&(!c.result||typeof c.result.title!=='string'||typeof c.result.reference!=='string'))return initial();
      if(id==='identity'&&['completed','collection_ready'].includes(c.stage)&&(!Number.isInteger(c.result.issuedDay)||c.result.issuedDay<0||c.result.issuedDay>d.day))return initial();
      if(id!=='birth'&&id!=='identity'&&!['completed','collection_ready'].includes(s.cases.birth.stage))return initial();
    }
    if(!s.notifications.every(n=>n&&ids.includes(n.id)&&typeof n.message==='string'&&typeof n.key==='string'&&typeof n.read==='boolean'&&typeof n.at==='string'))return initial();
    if(['submitted','visit_required'].includes(s.cases.identity?.stage)&&d.visitDue===null)return initial();
    return evaluateDeadlines(s);
  }catch{return initial();}
}
