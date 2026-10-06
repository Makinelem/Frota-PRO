// ==================== 1. DADOS ====================
let veiculos = JSON.parse(
  localStorage.getItem('vf_veic') ||
  '[{"id":1,"nome":"VW SAVEIRO INTERNET","placa":"NIX5F99","ano":"2022","kmAtual":0,"horasAtual":0},{"id":2,"nome":"FIAT UNO MILLE","placa":"OCB8C72","ano":"2010","kmAtual":0,"horasAtual":0}]'
);
let abasts = JSON.parse(localStorage.getItem('vf_abast') || '[]');
let manuts = JSON.parse(localStorage.getItem('vf_manut') || '[]');
let pecas = JSON.parse(localStorage.getItem('vf_pecas') || '[]');
let tiposManut = JSON.parse(
  localStorage.getItem('vf_tipos') ||
  '["Óleo","Filtro","Pneu","Freio","Correia","Revisão","Outros"]'
);
let editAbastId = null;
let editManutId = null;
let editPecaId = null;
let tipoControle = 'km';
let tipoPeca = 'Serviço';
let editVeiculoId = null;
let geradorSelecionadoId = null;
let pecasTempRevisao = [];

// ==================== 2. HELPERS ====================
function formatarNomeMotorista(str){
  if(!str) return '';
  return str.toLowerCase().split(' ').map(w => w? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ').trim();
}
function formatarNomeVeiculo(str){
  if(!str) return '';
  return str.trim().toUpperCase();
}
function isGerador(v){
  return (v.nome || '').toUpperCase().includes('GERADOR');
}
function save(){
  localStorage.setItem('vf_veic', JSON.stringify(veiculos));
  localStorage.setItem('vf_abast', JSON.stringify(abasts));
  localStorage.setItem('vf_manut', JSON.stringify(manuts));
  localStorage.setItem('vf_pecas', JSON.stringify(pecas));
  render();
}
function saveTipos(){ localStorage.setItem('vf_tipos', JSON.stringify(tiposManut)); }
function savePecas(){ localStorage.setItem('vf_pecas', JSON.stringify(pecas)); renderPecas(); }
function getKMLColor(k){ if(k >= 10) return 'b-green'; if(k >= 6) return 'b-orange'; return 'b-red'; }
function getDot(k){ if(k >= 10) return 'dot-green'; if(k >= 6) return 'dot-orange'; return 'dot-red'; }
function setTipoControle(t){
  tipoControle = t;
  document.getElementById('btnKM')?.classList.toggle('active', t === 'km');
  document.getElementById('btnHORA')?.classList.toggle('active', t === 'hora');
  document.getElementById('boxKM').style.display = t === 'km'? 'block' : 'none';
  document.getElementById('boxHORA').style.display = t === 'hora'? 'block' : 'none';
}
function setTipoPeca(t){
  tipoPeca = t;
  document.getElementById('btnPecaServico')?.classList.toggle('active', t === 'Serviço');
  document.getElementById('btnPecaPeca')?.classList.toggle('active', t === 'Peça');
  document.getElementById('btnPecaRest')?.classList.toggle('active', t === 'Restauração');
}
function trocarSubAbaManut(aba){
  document.getElementById('subPainelRevisao').style.display = aba === 'revisao'? 'block' : 'none';
  document.getElementById('subPainelPecas').style.display = aba === 'pecas'? 'block' : 'none';
  document.getElementById('btnSubRevisao')?.classList.toggle('active', aba === 'revisao');
  document.getElementById('btnSubPecas')?.classList.toggle('active', aba === 'pecas');
}
function atualizarRegraKM(){
  const veicId = Number(document.getElementById('a_veic').value);
  const veic = veiculos.find(v => v.id == veicId);
  const inputKm = document.getElementById('a_km');
  const labelKm = document.getElementById('labelKm');
  if(!veic ||!inputKm) return;
  if(!veic.placa){
    inputKm.required = false;
    if(labelKm) labelKm.innerText = 'KM ATUAL - SEM PONTO (OPCIONAL)';
    inputKm.placeholder = 'Opcional sem placa';
  } else {
    inputKm.required = true;
    if(labelKm) labelKm.innerText = 'KM ATUAL - SEM PONTO';
    inputKm.placeholder = '105000';
  }
}

// ==================== 3. TIPOS ====================
function renderTiposCheck(){
  const div = document.getElementById('listaTiposCheck');
  if(div){
    const atuais = getTiposSelecionados();
    div.innerHTML = tiposManut.map(t => `
      <label class="check-item">
        <input type="checkbox" value="${t}" class="chkTipo" onchange="atualizarTextoTipo()">
        ${t}
      </label>
    `).join('');
    setTimeout(() => {
      document.querySelectorAll('.chkTipo').forEach(chk => {
        if(atuais.includes(chk.value)) chk.checked = true;
      });
      atualizarTextoTipo();
    }, 20);
  }
  const sel = document.getElementById('sel_m_tipo');
  if(sel){
    const atual = sel.value;
    sel.innerHTML = '<option value="">Todos</option>' + tiposManut.map(t => `<option value="${t}">${t}</option>`).join('');
    sel.value = atual;
  }
}
function abrirModalTipos(){ document.getElementById('modalTipos').style.display = 'grid'; renderTiposCheck(); }
function fecharModalTipos(){ document.getElementById('modalTipos').style.display = 'none'; atualizarTextoTipo(); }
function atualizarTextoTipo(){
  const s = getTiposSelecionados();
  const txt = document.getElementById('txtTipoSelecionado');
  const count = document.getElementById('countSelecionado');
  if(count) count.innerText = s.length;
  if(!txt) return;
  if(s.length === 0){
    txt.innerText = 'Selecione os tipos...';
    txt.style.color = '#64748b';
    txt.style.fontWeight = '400';
  } else {
    txt.innerText = s.join(', ');
    txt.style.color = '#0f172a';
    txt.style.fontWeight = '600';
  }
}
function addTipoManut(){
  const inp = document.getElementById('m_tipo_novo');
  const novo = inp.value.trim();
  if(!novo) return;
  if(!tiposManut.includes(novo)){ tiposManut.push(novo); saveTipos(); renderTiposCheck(); }
  setTimeout(() => {
    const chk = [...document.querySelectorAll('.chkTipo')].find(c => c.value === novo);
    if(chk) chk.checked = true;
    atualizarTextoTipo();
  }, 50);
  inp.value = '';
}
function getTiposSelecionados(){ return [...document.querySelectorAll('.chkTipo:checked')].map(c => c.value); }
function atualizarKmVeiculo(id){
  const v = veiculos.find(x => x.id == id); if(!v) return;
  const novoKm = prompt(`Atualizar KM atual de ${v.nome}\nKM atual: ${v.kmAtual || 0}`, v.kmAtual || 0); if(novoKm === null) return;
  const novaHora = prompt(`Atualizar HORAS atual de ${v.nome}\nHoras atual: ${v.horasAtual || 0}`, v.horasAtual || 0); if(novaHora === null) return;
  v.kmAtual = Number(novoKm) || 0; v.horasAtual = Number(novaHora) || 0; save();
}

// ==================== 4. VEÍCULOS ====================
function addVeiculo(e){
  if(e) e.preventDefault();
  const nome = formatarNomeVeiculo(document.getElementById('v_nome').value || '');
  const placa = (document.getElementById('v_placa').value || '').trim().toUpperCase();
  const ano = (document.getElementById('v_ano').value || '').trim();
  if(!nome) return alert('Informe o nome do veículo');
  if(editVeiculoId){
    let idx = veiculos.findIndex(v => v.id == editVeiculoId);
    if(idx > -1){ veiculos[idx].nome = nome; veiculos[idx].placa = placa; veiculos[idx].ano = ano; }
    editVeiculoId = null;
  } else {
    veiculos.push({ id: Date.now(), nome, placa, ano, kmAtual: 0, horasAtual: 0 });
  }
  save();
  document.getElementById('v_nome').value = ''; document.getElementById('v_placa').value = ''; document.getElementById('v_ano').value = '';
  const bS = document.getElementById('btnSalvarVeic'); const bC = document.getElementById('btnCancelVeic');
  if(bS){ bS.innerHTML = '+ Cadastrar veículo'; bS.style.background = ''; }
  if(bC) bC.style.display = 'none';
}
function deleteVeiculo(id){
  if(!confirm('Excluir veículo e todos os registros dele?')) return;
  if(editVeiculoId == id) cancelarEdicaoVeiculo();
  if(geradorSelecionadoId == id) fecharHistGerador();
  veiculos = veiculos.filter(v => v.id!= id);
  abasts = abasts.filter(a => a.veicId!= id);
  manuts = manuts.filter(m => m.veicId!= id);
  pecas = pecas.filter(p => p.veicId!= id);
  save();
}
function editVeiculo(id){
  const v = veiculos.find(x => x.id == id); if(!v) return;
  editVeiculoId = id;
  document.getElementById('v_nome').value = v.nome;
  document.getElementById('v_placa').value = v.placa;
  document.getElementById('v_ano').value = v.ano || '';
  const bS = document.getElementById('btnSalvarVeic'); const bC = document.getElementById('btnCancelVeic');
  if(bS){ bS.innerHTML = '✓ Salvar edição (' + v.nome + ')'; bS.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)'; }
  if(bC) bC.style.display = 'block';
  window.scrollTo({top:0, behavior:'smooth'}); document.getElementById('v_nome').focus();
}
function cancelarEdicaoVeiculo(){
  editVeiculoId = null;
  document.getElementById('v_nome').value = ''; document.getElementById('v_placa').value = ''; document.getElementById('v_ano').value = '';
  const bS = document.getElementById('btnSalvarVeic'); const bC = document.getElementById('btnCancelVeic');
  if(bS){ bS.innerHTML = '+ Cadastrar veículo'; bS.style.background = ''; }
  if(bC) bC.style.display = 'none';
}
function renderVeiculos(){
  const busca = (document.getElementById('searchPlaca').value || '').toUpperCase();
  let lista = veiculos.filter(v =>!isGerador(v));
  if(busca) lista = lista.filter(v => (v.placa || '').includes(busca) || v.nome.toUpperCase().includes(busca));
  document.getElementById('countVeic').innerText = veiculos.filter(v =>!isGerador(v)).length;
  document.getElementById('listaVeiculos').innerHTML = lista.map(v => `
      <div class="vehicle">
        <div style="display:flex;gap:8px;align-items:center">
          <div class="v-icon">${(v.placa || v.nome).slice(0,3)}</div>
          <div>
            <b style="font-size:12px">${v.nome}</b><br>
            <span style="font-size:11px;color:#64748b">${v.placa || 'SEM PLACA'} ${v.ano? '- ' + v.ano : ''}</span>
          </div>
        </div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-g btn-sm" onclick="editVeiculo(${v.id})"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
          <button class="btn btn-del btn-sm" onclick="deleteVeiculo(${v.id})"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
        </div>
      </div>
    `).join('') || '<div style="text-align:center;color:#94a3b8;font-size:11px;padding:12px">Nenhum veículo</div>';
  const opts = veiculos.map(v => `<option value="${v.id}">${v.nome} - ${v.placa || 'SEM PLACA'}</option>`).join('');
  document.getElementById('a_veic').innerHTML = opts || '<option value="">Cadastre um veículo</option>';
  const mVeic = document.getElementById('m_veic'); if(mVeic) mVeic.innerHTML = opts || '<option value="">Cadastre um veículo</option>';
  const pVeic = document.getElementById('p_veic'); if(pVeic) pVeic.innerHTML = opts || '<option value="">Cadastre um veículo</option>';
  if(window.lucide) lucide.createIcons();
  setTimeout(atualizarRegraKM, 50);
}

// ==================== 4.1 GERADORES ====================
function renderGeradores(){
  const elBusca = document.getElementById('searchGerador');
  const busca = (elBusca?.value || '').toUpperCase();
  let lista = veiculos.filter(isGerador);
  if(busca) lista = lista.filter(v => (v.placa || '').toUpperCase().includes(busca) || v.nome.toUpperCase().includes(busca));
  const countGer = document.getElementById('countGer'); if(countGer) countGer.innerText = veiculos.filter(isGerador).length;
  const div = document.getElementById('listaGeradores'); if(!div) return;
  div.innerHTML = lista.map(v => `
    <div class="vehicle" style="${geradorSelecionadoId == v.id? 'border-color:#f59e0b;background:#fffbeb' : ''};cursor:pointer" onclick="selecionarGerador(${v.id})">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="v-icon" style="background:#fef3c7;color:#d97706">⚡</div>
        <div><b style="font-size:12px">${v.nome}</b><br><span style="font-size:11px;color:#64748b">${v.placa || 'SEM PLACA'} - ${v.horasAtual || 0}h / ${v.kmAtual || 0}km</span></div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-g btn-sm" onclick="event.stopPropagation();editVeiculo(${v.id})"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
        <button class="btn btn-del btn-sm" onclick="event.stopPropagation();deleteVeiculo(${v.id})"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
      </div>
    </div>
  `).join('') || '<div style="text-align:center;color:#94a3b8;font-size:11px;padding:12px">Nenhum gerador.<br>Cadastre com nome contendo GERADOR</div>';
  if(window.lucide) lucide.createIcons();
}
function selecionarGerador(id){
  geradorSelecionadoId = id;
  const v = veiculos.find(x => x.id == id);
  const box = document.getElementById('boxHistoricoGerador'); if(box) box.style.display = 'block';
  const nomeEl = document.getElementById('nomeGeradorHist'); if(nomeEl) nomeEl.innerText = v.nome + ' - ' + (v.placa || 'SEM PLACA');
  renderGeradores(); renderHistoricoGerador();
}
function fecharHistGerador(){ geradorSelecionadoId = null; const box = document.getElementById('boxHistoricoGerador'); if(box) box.style.display = 'none'; renderGeradores(); }
function trocarAbaGerador(aba){
  document.getElementById('histGerAbast').style.display = aba === 'abast'? 'block' : 'none';
  document.getElementById('histGerManut').style.display = aba === 'manut'? 'block' : 'none';
  document.getElementById('btnGerAbast')?.classList.toggle('active', aba === 'abast');
  document.getElementById('btnGerManut')?.classList.toggle('active', aba === 'manut');
}
function renderHistoricoGerador(){
  if(!geradorSelecionadoId) return;
  const id = geradorSelecionadoId;
  let listaA = abasts.filter(a => a.veicId == id).sort((a,b) => new Date(b.data) - new Date(a.data));
  let listaM = manuts.filter(m => m.veicId == id).sort((a,b) => new Date(b.data) - new Date(a.data));
  const divA = document.getElementById('histGerAbast'); const divM = document.getElementById('histGerManut');
  if(divA) divA.innerHTML = listaA.length? `<div style="overflow:auto"><table class="table"><thead><tr><th>DATA</th><th>LITROS</th><th>VALOR</th><th>H</th></tr></thead><tbody>${listaA.map(a => `<tr><td>${a.data}</td><td>${Number(a.litros).toFixed(2)}L</td><td>R$${a.valor.toFixed(2)}</td><td>${a.km || 0}</td></tr>`).join('')}</tbody></table></div>` : '<div style="padding:10px;text-align:center;color:#94a3b8;font-size:11px">Sem abastecimentos</div>';
  if(divM) divM.innerHTML = listaM.length? `<div style="overflow:auto"><table class="table"><thead><tr><th>DATA</th><th>TIPO</th><th>PRÓX</th></tr></thead><tbody>${listaM.map(m => `<tr><td>${m.data}</td><td style="font-size:10px">${m.tipo}</td><td>${m.horasProx || m.kmProx || '-'} ${m.tipoControle === 'hora'? 'h' : 'km'}</td></tr>`).join('')}</tbody></table></div>` : '<div style="padding:10px;text-align:center;color:#94a3b8;font-size:11px">Sem manutenções</div>';
}

// ==================== 5. ABASTECIMENTO ====================
function calcularKMLMap(){
  let map = {};
  veiculos.forEach(v => {
    let lista = abasts.filter(a => a.veicId == v.id).sort((a,b) => a.km - b.km || new Date(a.data) - new Date(b.data));
    for(let i = 0; i < lista.length; i++){
      let atual = lista[i]; let anterior = null;
      for(let j = i - 1; j >= 0; j--){ if(lista[j].km < atual.km){ anterior = lista[j]; break; } }
      if(anterior && atual.litros > 0){
        let diff = atual.km - anterior.km;
        if(diff > 0) map[atual.id] = { kml: diff / atual.litros, diff, anterior: anterior.km, dataAnt: anterior.data };
      }
    }
  });
  return map;
}
function addAbast(e){
  e.preventDefault();
  const veicId = Number(document.getElementById('a_veic').value);
  const kmVal = Number(document.getElementById('a_km').value);
  const veic = veiculos.find(v => v.id == veicId);
  if(!veicId) return alert('Selecione o veículo');
  if(veic && veic.placa &&!kmVal) return alert('Preencha KM - obrigatório para veículo com placa');
  const sel = document.getElementById('a_veic');
  let motoristaRaw = document.getElementById('a_motorista').value.trim();
  let motorista = motoristaRaw? formatarNomeMotorista(motoristaRaw) : 'Não Informado';
  const obj = { id: editAbastId || Date.now(), data: document.getElementById('a_data').value, veicId, veicNome: sel.options[sel.selectedIndex].text, motorista, litros: Number(document.getElementById('a_litros').value), valor: Number(document.getElementById('a_valor').value), km: kmVal || 0 };
  if(editAbastId){ abasts = abasts.filter(a => a.id!= editAbastId); editAbastId = null; document.getElementById('btnAbast').innerHTML = 'Registrar abastecimento'; }
  abasts.unshift(obj);
  const vv = veiculos.find(v => v.id == veicId); if(vv && kmVal > (vv.kmAtual || 0)) vv.kmAtual = kmVal;
  e.target.reset(); document.getElementById('a_data').value = new Date().toISOString().slice(0,10); document.getElementById('previewCalc').style.display = 'none'; save();
}
function deleteAbast(id){ if(!confirm('Excluir? Vai recalcular tudo.')) return; abasts = abasts.filter(a => a.id!= id); save(); }
function editAbast(id){
  const a = abasts.find(x => x.id == id); if(!a) return;
  editAbastId = id; document.getElementById('a_data').value = a.data; document.getElementById('a_veic').value = a.veicId; document.getElementById('a_motorista').value = a.motorista; document.getElementById('a_litros').value = a.litros; document.getElementById('a_valor').value = a.valor; document.getElementById('a_km').value = a.km;
  const btn = document.getElementById('btnAbast'); btn.innerHTML = '💾 Salvar edição'; btn.style.background = 'linear-gradient(135deg,#10b981,#06b6d4)'; trocarAbaDireita('abast'); window.scrollTo({top:0, behavior:'smooth'}); setTimeout(atualizarRegraKM, 100);
}

// ==================== 6. MANUTENÇÃO ====================
function addManut(e){
  e.preventDefault();
  const veicId = Number(document.getElementById('m_veic').value);
  const sel = document.getElementById('m_veic');
  const tipos = getTiposSelecionados();
  if(tipos.length === 0) return alert('Selecione pelo menos 1 tipo');
  const obj = {
    id: editManutId || Date.now(), veicId, veicNome: sel.options[sel.selectedIndex].text,
    tipo: tipos.join(', '), tiposArray: tipos, data: document.getElementById('m_data').value,
    kmAtual: tipoControle === 'km'? Number(document.getElementById('m_km_atual').value) || 0 : 0,
    kmProx: tipoControle === 'km'? Number(document.getElementById('m_km_prox').value) || 0 : 0,
    horasAtual: Number(document.getElementById('m_horas_atual').value) || 0,
    horasProx: tipoControle === 'hora'? Number(document.getElementById('m_horas_prox').value) || 0 : 0,
    tipoControle, obs: document.getElementById('m_obs').value.trim(),
    pecasUsadas: [...pecasTempRevisao]
  };
  if(editManutId){ manuts = manuts.filter(m => m.id!= editManutId); editManutId = null; document.getElementById('btnManut').innerHTML = 'Registrar manutenção'; }
  manuts.unshift(obj);
  const v = veiculos.find(x => x.id == veicId); if(v){ if(obj.kmAtual > (v.kmAtual || 0)) v.kmAtual = obj.kmAtual; if(obj.horasAtual > (v.horasAtual || 0)) v.horasAtual = obj.horasAtual; }
  e.target.reset(); document.getElementById('m_data').value = new Date().toISOString().slice(0,10); renderTiposCheck(); setTipoControle('km'); pecasTempRevisao = []; renderPecasTempRevisao(); save();
}
function getAlertaStatus(veic, manut){
  const kmAtualVeic = veic.kmAtual || manut.kmAtual || 0;
  const horasAtualVeic = veic.horasAtual || manut.horasAtual || 0;
  const faltaKm = (manut.kmProx || 0) - kmAtualVeic;
  const faltaH = (manut.horasProx || 0) - horasAtualVeic;
  const temKm = (manut.kmProx || 0) > 0; const temH = (manut.horasProx || 0) > 0;
  if(temKm && faltaKm <= 0) return { status:'vermelho', label:`Vencido ${Math.abs(faltaKm)}km` };
  if(temH && faltaH <= 0) return { status:'vermelho', label:`Vencido ${Math.abs(faltaH)}h` };
  if((temKm && faltaKm <= 1000) || (temH && faltaH <= 50)){
    let txt = []; if(temKm && faltaKm <= 1000) txt.push(`${faltaKm}km`); if(temH && faltaH <= 50) txt.push(`${faltaH}h`);
    return { status:'laranja', label:`Atenção ${txt.join(' / ')}` };
  }
  let txt = []; if(temKm) txt.push(`${faltaKm}km`); if(temH) txt.push(`${faltaH}h`);
  return { status:'verde', label:`${txt.join(' / ') || 'OK'}` };
}
function temTipoComum(aTipos, bTipos){ const A = aTipos || []; const B = bTipos || []; return A.some(t => B.includes(t)); }
function getStatusComHistorico(veic, mAtual, listaAscDoVeiculo){
  const idx = listaAscDoVeiculo.findIndex(x => x.id === mAtual.id);
  if(idx === -1) return getAlertaStatus(veic, mAtual);
  for(let j = idx + 1; j < listaAscDoVeiculo.length; j++){
    const prox = listaAscDoVeiculo[j];
    if(temTipoComum(mAtual.tiposArray || [mAtual.tipo], prox.tiposArray || [prox.tipo])){
      if(mAtual.tipoControle === 'hora'){
        const atraso = (prox.horasAtual || 0) - (mAtual.horasProx || 0);
        return atraso <= 0? { status:'cinza', label:'Concluída' } : { status:'cinza', label:`Atraso (${atraso}h)` };
      } else {
        const atraso = (prox.kmAtual || 0) - (mAtual.kmProx || 0);
        return atraso <= 0? { status:'cinza', label:'Concluída' } : { status:'cinza', label:`Atraso (${Math.abs(atraso)}km)` };
      }
    }
  }
  return getAlertaStatus(veic, mAtual);
}
function mostrarKmAtualManut(){
  const veicId = Number(document.getElementById('m_veic').value);
  const veic = veiculos.find(v => v.id == veicId);
  const box = document.getElementById('boxKmAtualInfo'); const txt = document.getElementById('txtKmAtualInfo');
  if(!veic ||!box) return;
  box.style.display = 'flex';
  txt.innerHTML = `<b>${veic.nome}</b> | Atual: <b>${veic.kmAtual || 0}km / ${veic.horasAtual || 0}h</b>`;
}
function atualizarKmHoraManut(){ const veicId = Number(document.getElementById('m_veic').value); if(!veicId) return alert('Selecione o veículo'); atualizarKmVeiculo(veicId); setTimeout(mostrarKmAtualManut, 200); }
function renderManut(){
  let veicsOrdenados = veiculos.slice().sort((a,b) => (a.placa || '').localeCompare(b.placa || ''));
  let html = `<div style="overflow:auto;margin-top:8px"><table class="table"><thead><tr><th>DATA</th><th>VEÍCULO</th><th>TIPO</th><th>ATUAL</th><th>PRÓXIMA</th><th>STATUS</th><th style="width:56px">AÇÕES</th></tr></thead><tbody>`;
  veicsOrdenados.forEach(veic => {
    let listaDesc = manuts.filter(m => m.veicId == veic.id).sort((a,b) => new Date(b.data) - new Date(a.data) || (b.kmAtual||0) - (a.kmAtual||0));
    let listaAsc = manuts.filter(m => m.veicId == veic.id).sort((a,b) => new Date(a.data) - new Date(b.data) || (a.kmAtual||0) - (b.kmAtual||0) || (a.horasAtual||0) - (b.horasAtual||0));
    if(listaDesc.length === 0) return;
    html += `<tr style="background:#f8fafc"><td colspan="7" style="padding:8px;font-weight:700;font-size:10px;border-top:1px solid #e2e8f0"><div style="display:flex;justify-content:space-between;align-items:center"><span>${veic.placa || 'SEM PLACA'} - <b>${veic.nome}</b> | Atual: ${veic.kmAtual || 0}km / ${veic.horasAtual || 0}h</span><button class="btn btn-g btn-sm" onclick="atualizarKmVeiculo(${veic.id})" style="background:#0f172a;color:#fff;font-size:9px;padding:4px 8px">📏 Atualizar KM/H</button></div></td></tr>`;
    listaDesc.forEach(m => {
      const alerta = getStatusComHistorico(veic, m, listaAsc);
      let corBadge = alerta.status === 'vermelho'? 'b-red' : alerta.status === 'laranja'? 'b-orange' : alerta.status === 'cinza'? 'b-gray' : 'b-green';
      let corDot = alerta.status === 'vermelho'? 'dot-red' : alerta.status === 'laranja'? 'dot-orange' : alerta.status === 'cinza'? 'dot-gray' : 'dot-green';
      let atualTxt = m.tipoControle === 'hora'? (veic.horasAtual || 0) + 'h' : (veic.kmAtual || 0) + 'km';
      const totalPecas = (m.pecasUsadas||[]).reduce((s,p)=>s+(Number(p.valor)||0),0);
      const qtdPecas = (m.pecasUsadas||[]).length;
      const infoPecas = qtdPecas>0? `<br><span style="font-size:9px;color:#0f172a;background:#e0f2fe;padding:1px 5px;border-radius:999px">🧩 ${qtdPecas} peça(s) - R$ ${totalPecas.toFixed(2)}</span><br><span style="font-size:8px;color:#64748b">${m.pecasUsadas.map(p=>p.desc).join(', ')}</span>` : '';
      html += `<tr style="${alerta.status==='cinza'? 'opacity:0.65;background:#f8fafc' : ''}"><td>${m.data}<br><span style="font-size:9px;color:#94a3b8">${m.kmAtual || m.horasAtual || ''}${m.tipoControle === 'hora'? 'h' : 'km'}</span></td><td><b>${veic.placa || 'S/PLACA'}</b></td><td style="font-size:10px">${m.tipo}${infoPecas}</td><td style="font-size:10px;font-weight:700">${atualTxt}</td><td style="font-size:10px">${m.kmProx? m.kmProx + 'km' : ''} ${m.horasProx? m.horasProx + 'h' : ''}</td><td><span class="badge ${corBadge}"><span class="dot ${corDot}"></span> ${alerta.label}</span></td><td style="display:flex;gap:2px"><button class="btn btn-g btn-sm" onclick="editManut(${m.id})">✏️</button><button class="btn btn-del btn-sm" onclick="deleteManut(${m.id})">🗑️</button></td></tr>`;
    });
  });
  html += '</tbody></table></div>';
  if(manuts.length === 0) html = '<div style="text-align:center;color:#94a3b8;padding:12px;font-size:11px">Nenhuma manutenção</div>';
  document.getElementById('listaManut').innerHTML = html;
}

// ==================== 7. TABELAS ====================
function renderTabela(){
  const kmlMap = calcularKMLMap();
  let veicsOrdenados = veiculos.slice().sort((a,b) => (a.placa || '').localeCompare(b.placa || ''));
  let html = `<div style="overflow:auto"><table class="table"><thead><tr><th>DATA</th><th>VEÍCULO</th><th>MOTORISTA</th><th>KM</th><th>LITROS</th><th>VALOR</th><th>KM/L</th><th style="width:56px">AÇÕES</th></tr></thead><tbody>`;
  veicsOrdenados.forEach(veic => {
    let listaVeic = abasts.filter(a => a.veicId == veic.id).sort((a,b) => new Date(a.data) - new Date(b.data) || a.km - b.km);
    if(listaVeic.length == 0) return;
    html += `<tr style="background:#f8fafc"><td colspan="8" style="padding:10px 8px;font-weight:700;font-size:11px;border-top:1px solid #e2e8f0">${veic.placa || 'SEM PLACA'} - <b>${veic.nome}</b><span style="background:#0f172a;color:#fff;padding:2px 8px;border-radius:999px;font-size:10px;margin-left:6px">${listaVeic.length}</span></td></tr>`;
    listaVeic.forEach(a => {
      const c = kmlMap[a.id];
      let kmLHtml = c? `<span class="badge ${getKMLColor(c.kml)}"><span class="dot ${getDot(c.kml)}"></span> ${c.kml.toFixed(2)}</span>` : '<span style="color:#94a3b8;font-size:10px">1º</span>';
      html += `<tr><td>${a.data}</td><td><b>${veic.placa || 'S/PLACA'}</b></td><td style="font-size:10px">${a.motorista}</td><td><b>${Number(a.km).toLocaleString('pt-BR')}</b></td><td>${Number(a.litros).toLocaleString('pt-BR',{minimumFractionDigits:3, maximumFractionDigits:3})}L</td><td>R$ ${Number(a.valor).toFixed(2)}</td><td>${kmLHtml}</td><td style="display:flex;gap:2px"><button class="btn btn-g btn-sm" onclick="editAbast(${a.id})">✏️</button><button class="btn btn-del btn-sm" onclick="deleteAbast(${a.id})">🗑️</button></td></tr>`;
    });
  });
  html += '</tbody></table></div>';
  if(abasts.length == 0) html = '<div style="text-align:center;color:#94a3b8;padding:20px;font-size:12px">Nenhum abastecimento</div>';
  document.getElementById('previewAbast').innerHTML = html;
}
function render(){
  renderVeiculos();
  renderGeradores();
  renderTabela();
  renderManut();
  renderPecas();
  renderTiposCheck();
  if(geradorSelecionadoId) renderHistoricoGerador();
}

// ==================== 8. RELATÓRIOS (MANTIDOS IGUAIS) ====================
function gerarRelatorioGeral(){
  const kmlMap = calcularKMLMap();
  let veiculosFiltrados = veiculos.filter(v =>!v.nome.toUpperCase().includes('GERADOR'));
  let conteudo = `<div style="font-family:Arial;font-size:10px;color:#334155"><h2 style="font-size:14px;font-weight:700;margin:0 0 4px">Relatório Geral - Abastecimento</h2><p style="font-size:10px;color:#64748b;margin:0 0 12px">Gerado em ${new Date().toLocaleString('pt-BR')}</p>`;
  veiculosFiltrados.slice().sort((a,b) => (a.placa || '').localeCompare(b.placa || '')).forEach(veic => {
    let lista = abasts.filter(a => a.veicId == veic.id).sort((a,b) => new Date(a.data) - new Date(b.data)); if(lista.length == 0) return;
    conteudo += `<h3 style="font-size:11px;font-weight:700;background:#f8fafc;padding:6px 8px;border-radius:6px;border-left:3px solid #0f172a;margin:12px 0 6px"><b>${veic.nome} - ${veic.placa || 'SEM PLACA'}</b></h3><table style="width:100%;border-collapse:collapse;font-size:10px"><tr style="background:#f1f5f9;color:#475569"><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">DATA</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">MOTORISTA</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">KM</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">LITROS</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">VALOR</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">KM/L</th></tr>`;
    lista.forEach(a => { let c = kmlMap[a.id]; conteudo += `<tr><td style="padding:5px;border:1px solid #f1f5f9">${a.data}</td><td style="padding:5px;border:1px solid #f1f5f9">${a.motorista}</td><td style="padding:5px;border:1px solid #f1f5f9">${a.km}</td><td style="padding:5px;border:1px solid #f1f5f9">${Number(a.litros).toFixed(3)}L</td><td style="padding:5px;border:1px solid #f1f5f9">R$ ${a.valor.toFixed(2)}</td><td style="padding:5px;border:1px solid #f1f5f9">${c? c.kml.toFixed(2) : '1º'}</td></tr>`; });
    conteudo += '</table>';
  });
  conteudo += `</div>`; let w = window.open('', '_blank'); w.document.write(`<html><head><title>Relatório Geral</title><style>body{font-family:Arial;padding:20px;font-size:10px}@media print{button{display:none}}</style></head><body>${conteudo}<br><button onclick="window.print()" style="padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;font-size:11px">Salvar PDF</button></body></html>`); w.document.close();
}
function gerarRelatorioSeletivo(){
  const div = document.getElementById('listaCheckVeic');
  div.innerHTML = veiculos.map(v => `<label class="check-item"><input type="checkbox" class="chkSelVeic" value="${v.id}">${v.nome} - ${v.placa || 'SEM PLACA'}</label>`).join('') || '<div style="color:#94a3b8">Nenhum veículo</div>';
  document.getElementById('modalSeletivo').style.display = 'grid';
}
function executarSeletivo(){
  const ids = [...document.querySelectorAll('.chkSelVeic:checked')].map(c => Number(c.value)); if(ids.length === 0) return alert('Selecione pelo menos 1 veículo');
  const de = document.getElementById('sel_de').value; const ate = document.getElementById('sel_ate').value; const motorista = document.getElementById('sel_motorista').value.trim().toLowerCase();
  let filtrados = abasts.filter(a => ids.includes(a.veicId)); if(de) filtrados = filtrados.filter(a => new Date(a.data) >= new Date(de)); if(ate) filtrados = filtrados.filter(a => new Date(a.data) <= new Date(ate)); if(motorista) filtrados = filtrados.filter(a => a.motorista.toLowerCase().includes(motorista));
  if(filtrados.length === 0) return alert('Nenhum registro encontrado!'); document.getElementById('modalSeletivo').style.display = 'none';
  let conteudo = `<div style="font-family:Arial;font-size:10px"><h3 style="font-weight:700">Relatório Seletivo - Abastecimento (${ids.length} veículos)</h3><table style="width:100%;border-collapse:collapse;font-size:10px"><tr style="background:#f1f5f9"><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">DATA</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">VEÍCULO</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">KM</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">LITROS</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">VALOR</th></tr>`;
  filtrados.sort((a,b) => new Date(a.data) - new Date(b.data)).forEach(a => { conteudo += `<tr><td style="padding:5px;border:1px solid #f1f5f9">${a.data}</td><td style="padding:5px;border:1px solid #f1f5f9"><b>${a.veicNome}</b></td><td style="padding:5px;border:1px solid #f1f5f9">${a.km}</td><td style="padding:5px;border:1px solid #f1f5f9">${Number(a.litros).toFixed(3)}L</td><td style="padding:5px;border:1px solid #f1f5f9">R$ ${a.valor.toFixed(2)}</td></tr>`; });
  conteudo += '</table></div>'; let w = window.open('', '_blank'); w.document.write(`<html><head><title>Seletivo</title><style>body{font-family:Arial;padding:20px;font-size:10px}</style></head><body>${conteudo}<br><button onclick="window.print()">Salvar PDF</button></body></html>`); w.document.close();
}
function gerarRelatorioManutGeral(){
  let veiculosFiltrados = veiculos.filter(v =>!v.nome.toUpperCase().includes('GERADOR'));
  let conteudo = `<div style="font-family:Arial;font-size:10px;color:#334155"><h2 style="font-size:14px;font-weight:700;margin:0 0 4px">Relatório Geral - Manutenção</h2><p style="font-size:10px;color:#64748b">Gerado em ${new Date().toLocaleString('pt-BR')}</p>`;
  veiculosFiltrados.slice().sort((a,b) => (a.placa || '').localeCompare(b.placa || '')).forEach(veic => {
    let lista = manuts.filter(m => m.veicId == veic.id).sort((a,b) => new Date(a.data) - new Date(b.data)); if(lista.length == 0) return;
    conteudo += `<h3 style="font-size:11px;font-weight:700;background:#f8fafc;padding:6px 8px;border-radius:6px;border-left:3px solid #10b981"><b>${veic.nome} - ${veic.placa || 'SEM PLACA'}</b></h3><table style="width:100%;border-collapse:collapse;font-size:10px"><tr style="background:#f1f5f9;color:#475569"><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">DATA</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">TIPO</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">ATUAL</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">PRÓXIMA TROCA</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">STATUS</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">OBS</th><th style="font-weight:700;padding:6px;text-align:left;border:1px solid #e2e8f0">PEÇAS</th></tr>`;
    lista.forEach(m => {
      const al = getAlertaStatus(veic, m);
      const pecasTxt = (m.pecasUsadas||[]).map(p=>`${p.desc} - R$ ${Number(p.valor).toFixed(2)}`).join('<br>') || '-';
      const totalPecas = (m.pecasUsadas||[]).reduce((s,p)=>s+Number(p.valor||0),0);
      conteudo += `<tr><td style="padding:5px;border:1px solid #f1f5f9">${m.data}</td><td style="padding:5px;border:1px solid #f1f5f9">${m.tipo}</td><td style="padding:5px;border:1px solid #f1f5f9">${m.tipoControle === 'hora'? m.horasAtual + 'h' : m.kmAtual + 'km'}</td><td style="padding:5px;border:1px solid #f1f5f9">${m.tipoControle === 'hora'? m.horasProx + 'h' : m.kmProx + 'km'}</td><td style="padding:5px;border:1px solid #f1f5f9">${al.label}</td><td style="padding:5px;border:1px solid #f1f5f9">${m.obs || ''}</td><td style="padding:5px;border:1px solid #f1f5f9">${pecasTxt}${totalPecas? `<br><b>Total: R$ ${totalPecas.toFixed(2)}</b>` : ''}</td></tr>`;
    });
    conteudo += '</table><br>';
  });
  conteudo += `</div>`; let w = window.open('', '_blank'); w.document.write(`<html><head><title>Manutenção Geral</title><style>body{font-family:Arial;padding:20px;font-size:10px}@media print{button{display:none}}</style></head><body>${conteudo}<br><button onclick="window.print()" style="padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px">Salvar PDF</button></body></html>`); w.document.close();
}
function gerarRelatorioManutSeletivo(){
  const div = document.getElementById('listaCheckManutVeic'); div.innerHTML = veiculos.map(v => `<label class="check-item"><input type="checkbox" class="chkSelManut" value="${v.id}">${v.nome} - ${v.placa || 'SEM PLACA'}</label>`).join('') || '<div style="color:#94a3b8">Nenhum veículo</div>';
  const sel = document.getElementById('sel_m_tipo'); if(sel){ const atual = sel.value; sel.innerHTML = '<option value="">Todos</option>' + tiposManut.map(t => `<option value="${t}">${t}</option>`).join(''); sel.value = atual; }
  document.getElementById('modalManut').style.display = 'grid';
}
function executarManutSeletivo(){
  const ids = [...document.querySelectorAll('.chkSelManut:checked')].map(c => Number(c.value)); if(ids.length === 0) return alert('Selecione pelo menos 1 veículo');
  const de = document.getElementById('sel_m_de').value; const ate = document.getElementById('sel_m_ate').value; const tipo = document.getElementById('sel_m_tipo').value;
  let filtrados = manuts.filter(m => ids.includes(m.veicId)); if(de) filtrados = filtrados.filter(m => new Date(m.data) >= new Date(de)); if(ate) filtrados = filtrados.filter(m => new Date(m.data) <= new Date(ate)); if(tipo) filtrados = filtrados.filter(m => m.tipo.includes(tipo));
  if(filtrados.length === 0) return alert('Nenhuma manutenção encontrada!'); document.getElementById('modalManut').style.display = 'none';
  let conteudo = `<div style="font-family:Arial;font-size:10px"><h3 style="font-weight:700">Relatório Seletivo - Manutenção (${ids.length} veículos)</h3><table style="width:100%;border-collapse:collapse;font-size:10px"><tr style="background:#f1f5f9"><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">DATA</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">VEÍCULO</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">TIPO</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">PRÓXIMA</th><th style="font-weight:700;padding:6px;border:1px solid #e2e8f0">PEÇAS</th></tr>`;
  filtrados.sort((a,b) => new Date(a.data) - new Date(b.data)).forEach(m => {
    const pecasTxt = (m.pecasUsadas||[]).map(p=>`${p.desc} R$${Number(p.valor).toFixed(2)}`).join('<br>') || '-';
    conteudo += `<tr><td style="padding:5px;border:1px solid #f1f5f9">${m.data}</td><td style="padding:5px;border:1px solid #f1f5f9"><b>${m.veicNome}</b></td><td style="padding:5px;border:1px solid #f1f5f9">${m.tipo}</td><td style="padding:5px;border:1px solid #f1f5f9">${m.tipoControle === 'hora'? m.horasProx + 'h' : m.kmProx + 'km'}</td><td style="padding:5px;border:1px solid #f1f5f9">${pecasTxt}</td></tr>`;
  });
  conteudo += '</table></div>'; let w = window.open('', '_blank'); w.document.write(`<html><head><title>Seletivo Manutenção</title><style>body{font-family:Arial;padding:20px;font-size:10px}</style></head><body>${conteudo}<br><button onclick="window.print()">Salvar PDF</button></body></html>`); w.document.close();
}

// ==================== 9. ABAS ====================
function trocarAbaDireita(aba){
  const pAbast = document.getElementById('painelAbast'); const pManut = document.getElementById('painelManut');
  const bAbast = document.getElementById('abaBtnAbast'); const bManut = document.getElementById('abaBtnManut');
  if(pAbast) pAbast.style.display = aba === 'abast'? 'block' : 'none';
  if(pManut) pManut.style.display = aba === 'manut'? 'block' : 'none';
  if(bAbast) bAbast.classList.toggle('ativa', aba === 'abast');
  if(bManut) bManut.classList.toggle('ativa', aba === 'manut');
}

// ==================== 10. LISTENERS ====================
document.addEventListener('input', e => {
  if(['a_km','a_litros','a_veic'].includes(e.target.id)){
    const vid = Number(document.getElementById('a_veic').value); const km = Number(document.getElementById('a_km').value); const litros = Number(document.getElementById('a_litros').value); const pc = document.getElementById('previewCalc');
    if(!vid ||!km ||!litros){ pc.style.display = 'none'; return; }
    let listaV = abasts.filter(x => x.veicId == vid).sort((a,b) => a.km - b.km); let ant = null;
    for(let i = listaV.length - 1; i >= 0; i--){ if(listaV[i].km < km){ ant = listaV[i]; break; } }
    if(ant){ const d = km - ant.km; const k = d / litros; pc.style.display = 'block'; pc.innerHTML = `📏 (${km} - ${ant.km} = ${d}km) / ${litros}L = <b>${k.toFixed(2)} km/l</b> | Anterior: ${ant.data}`; }
    else { pc.style.display = 'block'; pc.innerHTML = 'ℹ️ Primeiro abastecimento'; }
  }
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && editVeiculoId) cancelarEdicaoVeiculo(); });
document.addEventListener('DOMContentLoaded', () => {
  const t = new Date().toISOString().slice(0,10);
  document.getElementById('a_data').value = t;
  const md = document.getElementById('m_data'); if(md) md.value = t;
  const pd = document.getElementById('p_data'); if(pd) pd.value = t;
  render(); setTipoControle('km'); setTipoPeca('Serviço');
});
function deleteManut(id){ if(!confirm('Excluir manutenção?')) return; manuts = manuts.filter(m => m.id!= id); save(); }
function editManut(id){
  const m = manuts.find(x => x.id == id); if(!m) return;
  editManutId = id; document.getElementById('m_veic').value = m.veicId; document.getElementById('m_data').value = m.data;
  document.getElementById('m_km_atual').value = m.kmAtual || ''; document.getElementById('m_km_prox').value = m.kmProx || '';
  document.getElementById('m_horas_atual').value = m.horasAtual || ''; document.getElementById('m_horas_prox').value = m.horasProx || '';
  document.getElementById('m_obs').value = m.obs || ''; setTipoControle(m.tipoControle || 'km');
  pecasTempRevisao = m.pecasUsadas? [...m.pecasUsadas] : [];
  renderPecasTempRevisao();
  setTimeout(() => { document.querySelectorAll('.chkTipo').forEach(c => { c.checked = (m.tiposArray || []).includes(c.value); }); atualizarTextoTipo(); }, 100);
  trocarAbaDireita('manut'); trocarSubAbaManut('revisao');
  const btn = document.getElementById('btnManut'); if(btn){ btn.innerHTML = '💾 Salvar edição'; btn.style.background = 'linear-gradient(135deg,#10b981,#06b6d4)'; }
}

// ==================== 11. PEÇAS - NOVO ====================
function addPeca(e){
  e.preventDefault();
  const veicId = Number(document.getElementById('p_veic').value);
  const sel = document.getElementById('p_veic');
  const obj = {
    id: editPecaId || Date.now(), veicId, veicNome: sel.options[sel.selectedIndex].text,
    data: document.getElementById('p_data').value, tipoPeca: tipoPeca,
    desc: document.getElementById('p_desc').value.trim(),
    valor: Number(document.getElementById('p_valor').value) || 0
  };
  if(editPecaId) pecas = pecas.filter(p => p.id!= editPecaId);
  editPecaId = null; pecas.unshift(obj);
  e.target.reset(); document.getElementById('p_data').value = new Date().toISOString().slice(0,10); setTipoPeca('Serviço'); save();
}
function deletePeca(id){ if(!confirm('Excluir peça?')) return; pecas = pecas.filter(p => p.id!= id); save(); }
function editPeca(id){
  const p = pecas.find(x => x.id == id); if(!p) return;
  editPecaId = id; document.getElementById('p_veic').value = p.veicId; document.getElementById('p_data').value = p.data;
  document.getElementById('p_desc').value = p.desc; document.getElementById('p_valor').value = p.valor; setTipoPeca(p.tipoPeca);
  trocarAbaDireita('manut'); trocarSubAbaManut('pecas');
}
function renderPecas(){
  const div = document.getElementById('listaPecas'); if(!div) return;
  if(pecas.length === 0){ div.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:12px;font-size:11px">Nenhuma peça/serviço</div>'; return; }
  div.innerHTML = `<div style="overflow:auto"><table class="table"><thead><tr><th>DATA</th><th>VEÍCULO</th><th>TIPO</th><th>DESCRIÇÃO</th><th>VALOR</th><th>AÇÃO</th></tr></thead><tbody>${pecas.map(p=>`<tr><td>${p.data}</td><td><b>${(p.veicNome||'').split('-')[0]}</b></td><td><span class="badge b-gray">${p.tipoPeca}</span></td><td style="font-size:11px">${p.desc}</td><td>R$ ${p.valor.toFixed(2)}</td><td style="display:flex;gap:2px"><button class="btn btn-g btn-sm" onclick="editPeca(${p.id})">✏️</button><button class="btn btn-del btn-sm" onclick="deletePeca(${p.id})">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
}
function gerarRelatorioPecasGeral(){
  if(pecas.length===0) return alert('Nenhuma peça cadastrada');
  let conteudo = `<div style="font-family:Arial;font-size:10px"><h3>Relatório Geral - Peças (${pecas.length})</h3><table style="width:100%;border-collapse:collapse;font-size:10px"><tr style="background:#f1f5f9"><th style="border:1px solid #e2e8f0;padding:6px">DATA</th><th style="border:1px solid #e2e8f0;padding:6px">VEÍCULO</th><th style="border:1px solid #e2e8f0;padding:6px">TIPO</th><th style="border:1px solid #e2e8f0;padding:6px">DESC</th><th style="border:1px solid #e2e8f0;padding:6px">VALOR</th></tr>${pecas.map(p=>`<tr><td style="border:1px solid #f1f5f9;padding:5px">${p.data}</td><td style="border:1px solid #f1f5f9;padding:5px">${p.veicNome}</td><td style="border:1px solid #f1f5f9;padding:5px">${p.tipoPeca}</td><td style="border:1px solid #f1f5f9;padding:5px">${p.desc}</td><td style="border:1px solid #f1f5f9;padding:5px">R$ ${p.valor.toFixed(2)}</td></tr>`).join('')}</table></div>`;
  let w=window.open('','_blank'); w.document.write(`<html><head><title>Peças Geral</title><style>body{font-family:Arial;padding:20px}</style></head><body>${conteudo}<br><button onclick="window.print()">Salvar PDF</button></body></html>`); w.document.close();
}
function gerarRelatorioPecasSeletivo(){
  const div=document.getElementById('listaCheckPecasVeic');
  div.innerHTML=veiculos.map(v=>`<label class="check-item"><input type="checkbox" class="chkSelPecas" value="${v.id}">${v.nome} - ${v.placa||'SEM PLACA'}</label>`).join('')||'<div style="color:#94a3b8">Nenhum veículo</div>';
  document.getElementById('modalPecas').style.display='grid';
}
function executarPecasSeletivo(){
  const ids=[...document.querySelectorAll('.chkSelPecas:checked')].map(c=>Number(c.value)); if(!ids.length) return alert('Selecione 1 veículo');
  const de=document.getElementById('sel_p_de').value; const ate=document.getElementById('sel_p_ate').value; const tipo=document.getElementById('sel_p_tipo').value;
  let f=pecas.filter(p=>ids.includes(p.veicId)); if(de) f=f.filter(p=>new Date(p.data)>=new Date(de)); if(ate) f=f.filter(p=>new Date(p.data)<=new Date(ate)); if(tipo) f=f.filter(p=>p.tipoPeca===tipo);
  if(!f.length) return alert('Nenhum registro'); document.getElementById('modalPecas').style.display='none';
  let conteudo=`<div style="font-family:Arial;font-size:10px"><h3>Relatório Seletivo Peças</h3><table style="width:100%;border-collapse:collapse">${f.map(p=>`<tr><td style="border:1px solid #f1f5f9;padding:5px">${p.data} - ${p.veicNome} - ${p.tipoPeca} - ${p.desc} - R$ ${p.valor.toFixed(2)}</td></tr>`).join('')}</table></div>`;
  let w=window.open('','_blank'); w.document.write(conteudo+'<br><button onclick="window.print()">Salvar PDF</button>'); w.document.close();
}

// ==================== 12. GERADORES ====================
function gerarRelatorioGeradorGeral(){ const dadosAbast = abasts.filter(a=>a.veicId && veiculos.find(v=>v.id==a.veicId && isGerador(v))); const dadosManut = manuts.filter(m=>m.veicId && veiculos.find(v=>v.id==m.veicId && isGerador(v))); if(!dadosAbast.length &&!dadosManut.length) return alert('Nenhum dado de gerador'); gerarPDFGerador(dadosAbast, dadosManut, 'Relatório Geral - Geradores'); }
function abrirSeletivoGerador(){ const div = document.getElementById('listaCheckGeradorVeic'); div.innerHTML = ''; let geradores = veiculos.filter(v => isGerador(v)); if(geradores.length === 0) geradores = veiculos; if(geradores.length === 0){ div.innerHTML = '<div style="padding:12px;text-align:center;color:#64748b">Nenhum gerador cadastrado</div>'; } else { geradores.forEach(v=>{ div.innerHTML += `<label class="check-item"><input type="checkbox" value="${v.id}" class="chkGer"><span>${v.nome} ${v.placa? '- ' + v.placa : ''}</span></label>`; }); } document.getElementById('modalGerador').style.display='grid'; }
function executarGeradorSeletivo(){ const ids = [...document.querySelectorAll('.chkGer:checked')].map(c=>Number(c.value)); const de = document.getElementById('sel_g_de').value; const ate = document.getElementById('sel_g_ate').value; let fAbast = abasts.filter(a=>ids.includes(a.veicId)); let fManut = manuts.filter(m=>ids.includes(m.veicId)); if(de){ fAbast = fAbast.filter(a=>a.data >= de); fManut = fManut.filter(m=>m.data >= de); } if(ate){ fAbast = fAbast.filter(a=>a.data <= ate); fManut = fManut.filter(m=>m.data <= ate); } document.getElementById('modalGerador').style.display='none'; gerarPDFGerador(fAbast, fManut, 'Relatório Seletivo - Geradores'); }
function gerarPDFGerador(abastGer, manutGer, titulo){ alert(titulo + ' - ' + (abastGer.length + manutGer.length) + ' registros encontrados.'); }

// ==================== 13. PEÇAS TEMP DA REVISÃO - NOVO ====================
function addPecaTempRevisao(){
  const d = document.getElementById('r_peca_desc')?.value.trim();
  const v = Number(document.getElementById('r_peca_valor')?.value) || 0;
  if(!d) return alert('Informe a peça');
  pecasTempRevisao.push({desc:d, valor:v});
  document.getElementById('r_peca_desc').value='';
  document.getElementById('r_peca_valor').value='';
  renderPecasTempRevisao();
}
function removePecaTempRevisao(i){ pecasTempRevisao.splice(i,1); renderPecasTempRevisao(); }
function renderPecasTempRevisao(){
  const div=document.getElementById('listaPecasTemp');
  const tot=document.getElementById('totalPecasTemp');
  if(!div) return;
  if(pecasTempRevisao.length===0){
    div.innerHTML='<span style="font-size:10px;color:#94a3b8">Nenhuma peça adicionada</span>';
    if(tot) tot.innerText='';
    return;
  }
  div.innerHTML=pecasTempRevisao.map((p,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 8px;font-size:11px"><span><b>${p.desc}</b> - R$ ${Number(p.valor).toFixed(2)}</span><button type="button" class="btn btn-del btn-sm" onclick="removePecaTempRevisao(${i})" style="padding:2px 6px">x</button></div>`).join('');
  const total=pecasTempRevisao.reduce((s,p)=>s+(Number(p.valor)||0),0);
  if(tot) tot.innerText='Total peças: R$ '+total.toFixed(2);
}