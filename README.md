# Frota PRO — edição modular

Esta edição separa a interface em arquivos mais fáceis de manter:

- `index.html` — estrutura da interface.
- `style.css` — estilos e temas, com ajustes de densidade/responsividade.
- `app.js` — lógica da interface e comunicação com o Apps Script.
- `code.gs` — backend Google Apps Script.
- `appsscript.json` — configuração do projeto Apps Script.
- `logo.png` — logotipo utilizado pela interface.

## Antes de publicar

1. Faça uma cópia de segurança da planilha `AbaManu`.
2. Faça uma cópia do projeto Apps Script atual.
3. Revise `code.gs` e publique uma nova versão do aplicativo da Web.
4. Confirme que a URL de implantação em `app.js` (`API_URL`) aponta para a implantação correta.
5. Publique `index.html`, `style.css`, `app.js` e `logo.png` juntos no mesmo diretório do GitHub Pages.

## Alterações relevantes

- CSS e JavaScript da página foram extraídos para arquivos separados.
- A interface recebeu pequenos ajustes para reduzir espaços e se adaptar melhor a telas pequenas.
- A inicialização da interface não chama mais automaticamente `recalcularConsumos`; ela carrega os dados sem disparar uma gravação geral na coluna de consumo.
- A exibição do consumo rejeita valores obviamente inválidos (por exemplo, data ISO ou número serial de data) e calcula um valor de apresentação quando possível.
- O cálculo do servidor foi ajustado para usar a data do abastecimento e o último abastecimento anterior válido do mesmo veículo. Registros com KM regressivo são marcados como `VERIFICAR KM` e não viram referência para o próximo cálculo.
- O erro de conexão exibido pelo cliente foi tornado mais informativo.

## Atenção importante

O frontend atual mantém compatibilidade com o protocolo JSONP do Apps Script. Isso significa que a chamada de login continua usando GET e que credenciais podem aparecer na URL da requisição no DevTools/histórico de rede. Para um sistema com dados reais, a próxima melhoria de segurança deve ser migrar a interface para servir dentro do próprio Apps Script (HTML Service com `google.script.run`) ou adotar um backend autenticado que não envie a senha em query string.

A coluna G só será recalculada no servidor quando a ação de recálculo for chamada explicitamente ou quando um registro de abastecimento for criado/editado. Não execute recálculo em produção antes de conferir os registros suspeitos e fazer backup.

## Observações de compatibilidade

Esta edição conserva os IDs e os handlers da interface original para manter as funcionalidades existentes. O arquivo `frota.js` do ZIP original era uma implementação local separada e não era carregado pelo `index.html`; por isso não foi usado como fonte da interface ativa.
