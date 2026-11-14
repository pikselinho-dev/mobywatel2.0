// Deterministyczny silnik demonstracyjny; bez połączeń sieciowych.
export const definitions = {
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
export const labels={draft:'W przygotowaniu',review:'Do zatwierdzenia',submitted:'Wysłano',received:'Odebrano',in_review:'Weryfikacja',needs_information:'Wymaga uzupełnienia',collection_ready:'Gotowe do odbioru',completed:'Zakończono'};
export const freshCase=(id)=>({id,stage:'draft',values:Object.fromEntries(definitions[id].fields.map(f=>[f.key,f.initial])),history:[],reason:'',response:'',result:null});
export const initial=()=>({version:2,cases:{birth:freshCase('birth')},notifications:[]});
const validField=(f,v)=>typeof v==='string'&& (f.kind==='text'?v.trim().length>0&&v.length<=60:f.options.some(([key])=>key===v));
export function errors(c){
  const out=definitions[c.id].fields.filter(f=>!validField(f,c.values[f.key])).map(f=>f.label);
  if(c.id==='birth'&&c.values.birthCard!=='confirmed')out.push('Karta urodzenia musi być dostępna w USC (symulacja).');
  return out;
}
export function canStart(s,id){
  return ids.includes(id)&&(id==='birth'||['completed','collection_ready'].includes(s.cases.birth?.stage));
}
export function transition(s,id,event,payload={}){
  if(!canStart(s,id))return s;
  if(event==='start'){
    if(s.cases[id])return s;
    return {...s,cases:{...s.cases,[id]:freshCase(id)}};
  }
  const c=s.cases[id]; if(!c)return s;
  let next=null, notice='';
  const stage=(value)=>({...c,stage:value,history:[...c.history,{stage:value,at:new Date().toISOString()}]});
  if(event==='edit'&&c.stage==='draft'){
    const f=definitions[id].fields.find(f=>f.key===payload.key);
    if(f&&typeof payload.value==='string'&&payload.value.length<=60&&(f.kind==='text'||payload.value===''||f.options.some(([v])=>v===payload.value)))next={...c,values:{...c.values,[f.key]:payload.value}};
  }
  if(event==='review'&&c.stage==='draft'&&!errors(c).length)next=stage('review');
  if(event==='back'&&c.stage==='review')next=stage('draft');
  if(event==='submit'&&c.stage==='review'&&payload.confirmed===true&&!errors(c).length)next=stage('submitted');
  if(event==='receive'&&c.stage==='submitted')next=stage('received');
  if(event==='inspect'&&c.stage==='received')next=stage('in_review');
  if(event==='request_info'&&c.stage==='in_review'&&!c.reason){
    next={...stage('needs_information'),reason:'Urząd prosi o potwierdzenie danych z wniosku (fikcyjne wezwanie).',response:''};
    notice='Sprawa wymaga uzupełnienia. Sprawdź wezwanie i przygotuj odpowiedź.';
  }
  if(event==='respond'&&c.stage==='needs_information'&&payload.confirmed===true&&typeof payload.response==='string'&&payload.response.trim().length>0&&payload.response.length<=500)
    next={...stage('in_review'),response:payload.response.trim()};
  if(event==='finish'&&c.stage==='in_review'){
    const birth=id==='birth';
    next={...stage(birth&&c.values.delivery==='office'?'collection_ready':'completed'),result:birth?{title:'Odpis aktu urodzenia – DEMO',reference:'USC-DEMO-001',child:c.values.name+' '+c.values.surname,pesel:'DEMO-NIE-JEST-PESEL',delivery:c.values.delivery}: {title:definitions[id].title+' – potwierdzenie demo',reference:id.toUpperCase()+'-DEMO-001'}};
    notice=birth?'Dokument jest gotowy. Sprawdź sposób odbioru.':'Sprawa została zakończona (symulacja).';
  }
  if(event==='collect'&&c.stage==='collection_ready'&&payload.confirmed===true){
    next=stage('completed');notice='Potwierdzono odbiór dokumentu (symulacja).';
  }
  if(!next)return s;
  return {...s,cases:{...s.cases,[id]:next},notifications:notice?[{id, message:notice, key:id+'-'+next.stage,at:new Date().toISOString(),read:false},...s.notifications]:s.notifications};
}
export function readNotice(s,key){
  return {...s,notifications:s.notifications.map(n=>n.key===key?{...n,read:true}:n)};
}
export function restore(raw){
  try {
    const s=JSON.parse(raw);
    if(s?.version!==2||!s.cases||!Array.isArray(s.notifications)||!s.cases.birth)return initial();
    for(const [id,c] of Object.entries(s.cases)){
      if(!ids.includes(id)||c.id!==id||!Object.hasOwn(labels,c.stage)||!c.values||!Array.isArray(c.history)||typeof c.reason!=='string'||typeof c.response!=='string')return initial();
      if(!c.history.every(h=>h&&Object.hasOwn(labels,h.stage)&&typeof h.at==='string'&&Number.isFinite(Date.parse(h.at))))return initial();
      if(!definitions[id].fields.every(f=>typeof c.values[f.key]==='string'&&c.values[f.key].length<=60&&(f.kind==='text'||c.values[f.key]===''||f.options.some(([v])=>v===c.values[f.key]))))return initial();
      if(c.stage!=='draft'&&errors(c).length)return initial();
      if(['completed','collection_ready'].includes(c.stage)&&(!c.result||typeof c.result.title!=='string'||typeof c.result.reference!=='string'))return initial();
      if(id!=='birth'&&!['completed','collection_ready'].includes(s.cases.birth.stage))return initial();
    }
    if(!s.notifications.every(n=>n&&ids.includes(n.id)&&typeof n.message==='string'&&typeof n.key==='string'&&typeof n.read==='boolean'&&typeof n.at==='string'))return initial();
    return s;
  }catch{return initial();}
}
