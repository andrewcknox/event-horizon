Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\launch-learn-capture.ps1"
portArg = "8787"

If WScript.Arguments.Count > 0 Then
  portArg = WScript.Arguments(0)
End If

command = "powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """ -Port " & portArg
shell.Run command, 0, False
