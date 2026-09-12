Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\launch-task-hud.ps1"
dateArg = ""
portArg = "8787"

If WScript.Arguments.Count > 0 Then
  dateArg = WScript.Arguments(0)
End If

If WScript.Arguments.Count > 1 Then
  portArg = WScript.Arguments(1)
End If

command = "powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """ -Date """ & dateArg & """ -Port " & portArg
shell.Run command, 0, False
