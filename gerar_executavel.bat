@echo off
chcp 65001 > nul
title Gerador de Executavel Windows (.exe) - Movimentacao da Loja
cls
echo ===================================================================
echo     GERADOR AUTOMATICO DE EXECUTAVEL WINDOWS (.EXE)
echo     Sistema de Controle de Movimentacao da Loja
echo ===================================================================
echo.
echo Este script ira:
echo 1. Verificar o Node.js
echo 2. Instalar as dependencias necessarias
echo 3. Compilar a interface
echo 4. Gerar o instalador e o executavel portatil (.exe) para Windows
echo.
echo Pressione qualquer tecla para iniciar a compilacao...
pause > nul
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no seu computador!
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo Depois de instalar, execute este arquivo novamente.
    echo.
    pause
    exit /b
)

echo [1/3] Instalando modulos do projeto...
call npm install
if %errorlevel% neq 0 (
    echo [AVISO] Tentando instalar com permissao padrao...
)

echo.
echo [2/3] Instalando ferramentas do Electron Builder...
call npm install --save-dev electron electron-builder
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao baixar o Electron. Verifique sua conexao de internet.
    pause
    exit /b
)

echo.
echo [3/3] Compilando a aplicacao e gerando os arquivos .EXE...
call npm run build
call npx electron-builder --win portable nsis

if %errorlevel% equ 0 (
    echo.
    echo ===================================================================
    echo     SUCESSO! O SEU PROGRAMA .EXE FOI GERADO COM SUCESSO!
    echo ===================================================================
    echo.
    echo Seus executaveis estao na pasta:
    echo  dist_electron\
    echo.
    echo Voce encontrara:
    echo  1. "Movimentacao da Loja.exe" (Versao Portatil - roda sem instalar)
    echo  2. "Movimentacao da Loja Setup.exe" (Instalador com icone na Area de Trabalho)
    echo.
    echo Abrindo a pasta do executavel...
    explorer dist_electron
) else (
    echo.
    echo [ERRO] Ocorreu uma falha ao gerar o executavel.
    echo Verifique os logs acima para mais detalhes.
)

echo.
pause
