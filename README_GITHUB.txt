FROTA PRO — VERSÃO PARA GITHUB PAGES

1. No GitHub, crie/abra o repositório que será usado pelo GitHub Pages.
2. Envie o arquivo index.html para a RAIZ do repositório.
3. Se este for o site de usuário, o repositório deve se chamar:
   makinelem.github.io
4. No GitHub, vá em Settings > Pages.
5. Em Build and deployment, selecione:
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
6. Salve e aguarde a publicação.

O index.html já está configurado para usar o Web App do Google Apps Script:
https://script.google.com/macros/s/AKfycbxz_mUNzlwFhiEYqInCdgShdUWOhcr74xqttGsZ4vQWxcuRUIeRyFH9ft2s4mgTr-V7eQ/exec

IMPORTANTE:
- O nome deve ser exatamente index.html, com i minúsculo.
- O arquivo deve ficar na raiz do repositório para a URL principal funcionar.
- Code.gs e appsscript.json pertencem ao Google Apps Script; não são executados pelo GitHub Pages.
- O GitHub Pages hospeda a interface. O Google Apps Script continua sendo o backend e o Google Sheets continua sendo o banco de dados.
