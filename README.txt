FROTA PRO - v1
================

BASE:
- Dados exclusivamente na planilha Google "AbaManu".
- Abas: VEÍCULOS, ABASTECImeNTO, MANUTENÇÃO, USERS.
- Login aceita NOME ou E-MAIL + SENHA.

1) GOOGLE SHEETS
Crie uma planilha com o nome exato: AbaManu

2) APPS SCRIPT
Abra Extensões > Apps Script.
Crie/cole o conteúdo de Code.gs.
Execute a função setup() uma vez para criar/ajustar as abas e cabeçalhos.
Aceite as permissões solicitadas.

3) PUBLICAR
Implantar > Nova implantação > Aplicativo da Web.
Executar como: Eu.
Quem tem acesso: Qualquer pessoa.
Copie a URL /exec.

4) APLICATIVO
Abra Index.html e localize:
const API_URL = 'COLE_AQUI_A_URL_DO_WEB_APP';
Substitua pelo endereço /exec do Apps Script.

5) USUÁRIOS
Na aba USERS, cadastre:
NOME | E-MAIL | SENHA
O login aceita o NOME ou o E-MAIL.

OBSERVAÇÕES
- Esta v1 usa a planilha como armazenamento principal e único dos registros.
- O navegador não grava veículos, abastecimentos, manutenções ou usuários em localStorage.
- O consumo é calculado no Apps Script usando o KM anterior do mesmo veículo.
- A regra de autenticação nesta v1 é simples, conforme solicitado. Para produção, podemos depois evoluir a segurança sem alterar a estrutura das abas.
