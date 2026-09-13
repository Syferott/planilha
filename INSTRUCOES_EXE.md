# Como exportar e usar o programa em .EXE (Windows)

Você tem **duas formas práticas** de usar este sistema como um programa desktop no seu computador Windows:

---

## ⚡ Método 1: Instalar Direto no Windows (Recomendado - Sem compilar)

O sistema foi preparado como uma **Aplicação Desktop Nativa (PWA)**. Você pode instalá-lo com apenas 2 cliques no navegador:

### No Microsoft Edge ou Google Chrome:
1. Acesse o sistema pelo navegador.
2. Olhe na barra de endereços (ao lado da estrela de favoritos):
   - No **Google Chrome**: Clique no ícone de computador com seta para baixo **"Instalar aplicativo"**.
   - No **Microsoft Edge**: Clique no ícone de três quadrados com um '+' ou acesse o menu `...` > **Aplicativos** > **Instalar este site como um aplicativo**.
3. O Windows criará automaticamente:
   - ✅ Um ícone no seu **Menu Iniciar**
   - ✅ Um atalho na sua **Área de Trabalho**
   - ✅ Janela independente própria (sem abas do navegador, sem barra de URL)
   - ✅ Permite fixar diretamente na **Barra de Tarefas do Windows**
   - ✅ Funciona offline com os dados salvos localmente!

---

## 📦 Método 2: Gerar o Arquivo Instalador `.exe` Standalone (Electron)

Se você precisa do arquivo executável real (`.exe`) para distribuir ou guardar em pendrive:

### Passo 1: Baixar o código do projeto
1. No menu superior direito do Google AI Studio, clique em **Export** (ou menu de configurações) e selecione **Download ZIP** (ou clone via GitHub).
2. Extraia o arquivo ZIP em uma pasta no seu computador.

### Passo 2: Gerar o executável
- **Opção Automática (Mais fácil)**:
  Dê um duplo clique no arquivo `gerar_executavel.bat` que está na pasta raiz. O script fará tudo sozinho!
  
- **Opção Manual via Terminal / Prompt de Comando**:
  Abra o terminal na pasta do projeto e execute:
  ```bash
  npm install
  npm run dist:exe
  ```

### Onde fica o arquivo `.exe`?
Ao finalizar o processo, será criada a pasta:
📁 `dist_electron/`

Dentro dela você terá:
- **`Movimentacao da Loja.exe`** (Versão Portátil: basta dar duplo clique para rodar, não precisa instalar).
- **`Movimentacao da Loja Setup.exe`** (Instalador completo do Windows com criação de atalhos e desinstalador).
