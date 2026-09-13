import React, { useState, useEffect } from 'react';
import { 
  X, 
  Monitor, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  FolderArchive, 
  Sparkles, 
  Laptop, 
  HardDrive, 
  ArrowRight,
  HelpCircle,
  FileCode
} from 'lucide-react';

interface ExportExeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportExeModal: React.FC<ExportExeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Para instalar no Windows:\n\n' +
        '1. No Microsoft Edge: clique no menu "..." no topo do navegador > "Aplicativos" > "Instalar este site como um aplicativo".\n' +
        '2. No Google Chrome: clique no ícone de instalação (ao lado da barra de favoritos no topo) ou menu "..." > "Salvar e compartilhar" > "Instalar página como app".\n\n' +
        'O Windows criará o atalho e executável nativo na sua Área de Trabalho e Barra de Tarefas!'
      );
    }
  };

  const handleDownloadBatch = () => {
    const batContent = `@echo off
chcp 65001 > nul
title Gerador de Executavel Windows (.exe) - Movimentacao da Loja
cls
echo ===================================================================
echo     GERADOR AUTOMATICO DE EXECUTAVEL WINDOWS (.EXE)
echo     Sistema de Controle de Movimentacao da Loja
echo ===================================================================
echo.
echo 1. Instalando dependencias do projeto...
call npm install
echo.
echo 2. Instalando ferramentas do Electron Builder...
call npm install --save-dev electron electron-builder
echo.
echo 3. Compilando e gerando o executavel .EXE para Windows...
call npm run build
call npx electron-builder --win portable nsis
echo.
if %errorlevel% equ 0 (
    echo [SUCESSO] Seu arquivo .exe foi gerado na pasta: dist_electron\\
    explorer dist_electron
) else (
    echo [ERRO] Ocorreu uma falha durante a criacao do executavel.
)
pause
`;
    const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gerar_executavel.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Exportar / Usar como Programa no Windows</h2>
              <p className="text-xs text-slate-300">Escolha o formato ideal para rodar no seu computador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            1. Instalar no Windows (1 Clique - Mais Rápido)
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'electron'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-600" />
            2. Gerar Arquivo .EXE (Electron)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <p className="font-semibold mb-1">Aplicação Desktop Nativa do Windows</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Você pode instalar o sistema agora mesmo sem precisar compilar nada. O Microsoft Edge ou Google Chrome cria automaticamente o atalho executável no <strong>Menu Iniciar</strong>, na <strong>Área de Trabalho</strong> e na <strong>Barra de Tarefas</strong>, rodando em janela própria como um aplicativo independente.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleInstallPWA}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors gap-2 text-sm"
                >
                  <Monitor className="w-4 h-4" />
                  {isInstalled ? 'Aplicativo Já Instalado no PC' : 'Instalar no Meu Computador Agora'}
                </button>
              </div>

              {/* Step by Step Guide */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Como funciona no seu navegador:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      No Microsoft Edge (Windows):
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Abra o menu <strong className="text-slate-800">...</strong> (canto superior direito).</li>
                      <li>Passe o mouse em <strong className="text-slate-800">Aplicativos</strong>.</li>
                      <li>Clique em <strong className="text-slate-800">"Instalar este site como um aplicativo"</strong>.</li>
                    </ol>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      No Google Chrome:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Na barra de endereços (topo), clique no ícone de <strong>instalação de aplicativo</strong>.</li>
                      <li>Ou clique nos <strong>3 pontinhos</strong> &gt; <strong>Salvar e compartilhar</strong> &gt; <strong>Instalar página</strong>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  Arquivos de Compilação do Electron Já Configurados no Projeto!
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Configuramos o arquivo <code>electron/main.cjs</code>, <code>electron-builder.json</code> e scripts para gerar o instalador oficial <strong>.exe</strong> para Windows.
                </p>
              </div>

              {/* Instructions Steps */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700">
                    <p className="font-bold text-slate-900 mb-0.5">Baixe o código do projeto</p>
                    <p className="text-slate-600">
                      No menu superior do Google AI Studio, clique nas configurações do projeto e selecione <strong>Export to ZIP</strong> (ou sincronize via GitHub).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700 flex-1">
                    <p className="font-bold text-slate-900 mb-1">Execute a geração automática do .EXE</p>
                    <p className="text-slate-600 mb-2">
                      Extraia o ZIP e dê dois cliques no arquivo <strong className="text-slate-900">gerar_executavel.bat</strong> incluso na pasta raiz.
                    </p>
                    <button
                      onClick={handleDownloadBatch}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-800 shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      Baixar script gerar_executavel.bat avulso
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700 flex-1">
                    <p className="font-bold text-slate-900 mb-1">Ou execute pelo terminal do seu computador:</p>
                    <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-2.5 rounded-lg flex items-center justify-between">
                      <code>npm run dist:exe</code>
                      <button
                        onClick={() => copyCommand('npm run dist:exe')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-sans font-semibold ml-2"
                      >
                        {copiedCmd ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span>
                  O instalador final será gerado em: <strong className="font-mono">dist_electron/Movimentacao da Loja.exe</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
