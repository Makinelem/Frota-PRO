const SPREADSHEET_NAME = 'AbaManu';
const SHEETS = {
  VEICULOS: 'VEÍCULOS',
  ABAST: 'ABASTECImeNTO',
  MANUT: 'MANUTENÇÃO',
  USERS: 'USERS'
};
const HEADERS = {
  'VEÍCULOS': ['NOME','PLACA','ANO'],
  'ABASTECImeNTO': ['DATA','VEÍCULO','MOTORISTA','LITROS','KM','VALOR','CONSUMO (KM/L)'],
  'MANUTENÇÃO': ['DATA','VEÍCULO','TIPO','KM ATUAL','PRÓXIMA'],
  'USERS': ['NOME','E-MAIL','SENHA']
};

function doGet(){return ContentService.createTextOutput(JSON.stringify({ok:true,app:'Frota PRO'})).setMimeType(ContentService.MimeType.JSON)}

function doPost(e){
  try{
    const p=JSON.parse(e.postData.contents||'{}');
    const a=p.action;
    if(a==='login') return out(login_(p));
    if(a==='getData') return out(getData_());
    if(a==='addVeiculo') return out(addRow_(SHEETS.VEICULOS,[p.nome,p.placa,p.ano]));
    if(a==='updateVeiculo') return out(updateById_(SHEETS.VEICULOS,p.id,[p.nome,p.placa,p.ano]));
    if(a==='deleteVeiculo') return out(deleteById_(SHEETS.VEICULOS,p.id));
    if(a==='addAbastecimento') return out(addAbast_(p));
    if(a==='updateAbastecimento') return out(updateById_(SHEETS.ABAST,p.id,[p.data,p.veiculo,p.motorista,p.litros,p.km,p.valor,p.consumo||'']));
    if(a==='deleteAbastecimento') return out(deleteById_(SHEETS.ABAST,p.id));
    if(a==='addManutencao') return out(addRow_(SHEETS.MANUT,[p.data,p.veiculo,p.tipo,p.kmAtual,p.proxima]));
    if(a==='updateManutencao') return out(updateById_(SHEETS.MANUT,p.id,[p.data,p.veiculo,p.tipo,p.kmAtual,p.proxima]));
    if(a==='deleteManutencao') return out(deleteById_(SHEETS.MANUT,p.id));
    throw new Error('Ação não reconhecida: '+a);
  }catch(err){return out({ok:false,error:String(err.message||err)})}
}
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function ss_(){
  const files=DriveApp.getFilesByName(SPREADSHEET_NAME);
  if(!files.hasNext()) throw new Error('Crie uma planilha chamada "'+SPREADSHEET_NAME+'" antes de usar o sistema.');
  return SpreadsheetApp.open(files.next());
}
function setup(){
  const ss=ss_();
  Object.keys(HEADERS).forEach(n=>{let sh=ss.getSheetByName(n);if(!sh)sh=ss.insertSheet(n);sh.getRange(1,1,1,HEADERS[n].length).setValues([HEADERS[n]]);});
  return {ok:true};
}
function sheet_(n){const s=ss_().getSheetByName(n);if(!s)throw new Error('Aba não encontrada: '+n);return s}
function rows_(n){const sh=sheet_(n),lr=sh.getLastRow(),lc=HEADERS[n].length;if(lr<2)return [];return sh.getRange(2,1,lr-1,lc).getValues().map((r,i)=>({id:i+2,values:r})).filter(x=>x.values.some(v=>String(v)!==''))}
function getData_(){return {ok:true,veiculos:rows_(SHEETS.VEICULOS).map(x=>({id:x.id,nome:x.values[0],placa:x.values[1],ano:x.values[2]})),abastecimentos:rows_(SHEETS.ABAST).map(x=>({id:x.id,data:x.values[0],veiculo:x.values[1],motorista:x.values[2],litros:x.values[3],km:x.values[4],valor:x.values[5],consumo:x.values[6]})),manutencoes:rows_(SHEETS.MANUT).map(x=>({id:x.id,data:x.values[0],veiculo:x.values[1],tipo:x.values[2],kmAtual:x.values[3],proxima:x.values[4]}))}}
function addRow_(n,v){const sh=sheet_(n);sh.appendRow(v);return {ok:true}}
function updateById_(n,id,v){const sh=sheet_(n),r=Number(id);if(!r||r<2||r>sh.getLastRow())throw new Error('Registro inválido.');sh.getRange(r,1,1,v.length).setValues([v]);return {ok:true}}
function deleteById_(n,id){const sh=sheet_(n),r=Number(id);if(!r||r<2||r>sh.getLastRow())throw new Error('Registro inválido.');sh.deleteRow(r);return {ok:true}}
function addAbast_(p){
  const a=Number(String(p.litros).replace(/\./g,'').replace(',','.'));
  const km=Number(String(p.km).replace(/\./g,'').replace(',','.'));
  if(!(a>0)||!(km>=0))throw new Error('Litros e KM precisam ser numéricos.');
  const hist=rows_(SHEETS.ABAST).filter(x=>String(x.values[1])===String(p.veiculo)).map(x=>Number(x.values[4])).filter(x=>!isNaN(x)).sort((x,y)=>y-x);
  let consumo='';
  if(hist.length && km>hist[0] && a>0) consumo=((km-hist[0])/a).toFixed(2);
  sheet_(SHEETS.ABAST).appendRow([p.data,p.veiculo,p.motorista,p.litros,p.km,p.valor,consumo]);
  return {ok:true};
}
function login_(p){
  const login=String(p.login||'').trim().toLowerCase(),senha=String(p.senha||'');
  if(!login||!senha)return {ok:true,authenticated:false};
  const users=rows_(SHEETS.USERS);
  const u=users.find(x=>String(x.values[0]).trim().toLowerCase()===login||String(x.values[1]).trim().toLowerCase()===login);
  if(!u||String(u.values[2])!==senha)return {ok:true,authenticated:false};
  return {ok:true,authenticated:true,user:{nome:u.values[0],email:u.values[1]}};
}