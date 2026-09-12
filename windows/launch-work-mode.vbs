Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\launch-work-mode.ps1"
minutesArg = "0"

If WScript.Arguments.Count > 0 Then
  minutesArg = WScript.Arguments(0)
End If

command = "powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptPath & """ -Minutes " & minutesArg
shell.Run command, 0, False
