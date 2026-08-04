!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER

Var LouvorJaPath
Var LouvorJaPathField
Var LouvorJaBrowseButton

Function LouvorJaBrowse
  nsDialogs::SelectFolderDialog "Selecione a pasta do LouvorJA" "$LouvorJaPath"
  Pop $0
  ${If} $0 != "error"
    StrCpy $LouvorJaPath "$0"
    ${NSD_SetText} $LouvorJaPathField "$LouvorJaPath"
  ${EndIf}
FunctionEnd

Function LouvorJaPageCreate
  nsDialogs::Create 1018
  Pop $0

  ${If} ${FileExists} "E:\Louvor JA\Louvor JA\config\database.db"
    StrCpy $LouvorJaPath "E:\Louvor JA\Louvor JA"
  ${ElseIf} ${FileExists} "C:\Louvor JA\config\database.db"
    StrCpy $LouvorJaPath "C:\Louvor JA"
  ${ElseIf} ${FileExists} "C:\Program Files\Louvor JA\config\database.db"
    StrCpy $LouvorJaPath "C:\Program Files\Louvor JA"
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 24u "Integração com o LouvorJA"
  Pop $0
  CreateFont $1 "$(^Font)" "11" "700"
  SendMessage $0 ${WM_SETFONT} $1 0

  ${NSD_CreateLabel} 0 28u 100% 28u "Indique a pasta que contém o LouvorJA.exe. O aplicativo usará esse caminho para pesquisar o catálogo e abrir o programa original."
  Pop $0

  ${NSD_CreateDirRequest} 0 62u 78% 13u "$LouvorJaPath"
  Pop $LouvorJaPathField
  ${NSD_CreateBrowseButton} 80% 62u 20% 13u "Procurar..."
  Pop $LouvorJaBrowseButton
  ${NSD_OnClick} $LouvorJaBrowseButton LouvorJaBrowse

  ${NSD_CreateLabel} 0 84u 100% 24u "O Lyrics Pro acessa o banco somente para leitura e não altera os arquivos do LouvorJA. Deixe vazio para configurar depois."
  Pop $0

  nsDialogs::Show
FunctionEnd

Function LouvorJaPageLeave
  ${NSD_GetText} $LouvorJaPathField $LouvorJaPath
  ${If} $LouvorJaPath == ""
    Return
  ${EndIf}

  ${If} ${FileExists} "$LouvorJaPath\config\database.db"
    Return
  ${ElseIf} ${FileExists} "$LouvorJaPath\Louvor JA\config\database.db"
    StrCpy $LouvorJaPath "$LouvorJaPath\Louvor JA"
    Return
  ${EndIf}

  MessageBox MB_ICONEXCLAMATION|MB_OK "Não encontrei config\database.db nessa pasta. Selecione a pasta que contém o LouvorJA.exe ou deixe o campo vazio para configurar depois."
  Abort
FunctionEnd

!macro customPageAfterChangeDir
  Page custom LouvorJaPageCreate LouvorJaPageLeave
!macroend

!macro customInstall
  ${If} $LouvorJaPath != ""
    CreateDirectory "$APPDATA\lyrics-pro-windows"
    FileOpen $0 "$APPDATA\lyrics-pro-windows\louvor-ja-path.txt" w
    FileWrite $0 "$LouvorJaPath"
    FileClose $0
  ${EndIf}
!macroend

!endif
