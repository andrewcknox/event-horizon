param(
  [string]$Date = "",
  [int]$Port = 8787
)

$ErrorActionPreference = "SilentlyContinue"

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies "PresentationFramework", "PresentationCore", "WindowsBase" -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class HudWindowNative {
  [DllImport("user32.dll")]
  public static extern bool ReleaseCapture();
  [DllImport("user32.dll")]
  public static extern IntPtr SendMessage(IntPtr hWnd, int msg, int wParam, int lParam);
  [DllImport("user32.dll", SetLastError=true)]
  public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
  [DllImport("user32.dll", SetLastError=true)]
  public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
  [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  private const int GWL_EXSTYLE = -20;
  private const int WS_EX_TOOLWINDOW = 0x00000080;
  private const int WS_EX_APPWINDOW = 0x00040000;
  private const int WS_EX_NOACTIVATE = 0x08000000;
  private const int SW_RESTORE = 9;

  public static void HideFromAltTab(IntPtr hWnd, bool noActivate) {
    int style = GetWindowLong(hWnd, GWL_EXSTYLE);
    style = style & ~WS_EX_APPWINDOW;
    style = style | WS_EX_TOOLWINDOW;
    if (noActivate) {
      style = style | WS_EX_NOACTIVATE;
    }
    SetWindowLong(hWnd, GWL_EXSTYLE, style);
  }

  public static void ShowInAltTab(IntPtr hWnd) {
    int style = GetWindowLong(hWnd, GWL_EXSTYLE);
    style = style & ~WS_EX_TOOLWINDOW;
    style = style & ~WS_EX_NOACTIVATE;
    style = style | WS_EX_APPWINDOW;
    SetWindowLong(hWnd, GWL_EXSTYLE, style);
  }

  public static bool RestoreExistingWindow(string title) {
    IntPtr hWnd = FindWindow(null, title);
    if (hWnd == IntPtr.Zero) {
      return false;
    }
    ShowWindow(hWnd, SW_RESTORE);
    SetForegroundWindow(hWnd);
    return true;
  }
}
"@

if (-not $Date) {
  $Date = Get-Date -Format "yyyy-MM-dd"
}

if ([HudWindowNative]::RestoreExistingWindow("Event Horizon HUD")) {
  exit
}

$baseUrl = "http://127.0.0.1:$Port"
$settingsPath = Join-Path (Split-Path -Parent $PSScriptRoot) "hud-settings.json"
$script:hudTasks = @()
$script:taskSignature = $null
$script:goalSignature = $null
$script:maxVisibleTasks = 5
$script:minVisibleTasks = 1
$script:maxVisibleTasksLimit = 12
$script:rowHeight = 54
$script:hudState = "empty"
# Set the first time a poll comes back, so a later failed poll can hold the
# rows already on screen instead of falling back to the offline placeholder.
$script:hudPolled = $false
$script:lastGoals = $null
$script:targetHeight = $null
$script:saveLayoutTimer = $null
$script:celebrationRandom = New-Object System.Random
$script:celebrationTimers = New-Object System.Collections.ArrayList
$script:celebrationKinds = @("confetti", "fire", "letsgo", "bowling", "fireworks", "coins")
$appSettingsPath = Join-Path (Split-Path -Parent $PSScriptRoot) "app-settings.json"
$script:lastCelebration = $null
$script:trayIcon = $null
$script:isClosingFromTray = $false
$script:hudMenuOpen = $false
# One id per launch, so rows from two HUDs started on the same day stay separable
# and a "start" can be paired with its "end". Set here rather than server-side
# because the server sees each row as an unrelated POST.
$script:hudSessionId = [guid]::NewGuid().ToString()
$script:hudStartedAt = $null

function Invoke-JsonRequest {
  param(
    [string]$Uri,
    [string]$Method = "GET",
    [object]$Body = $null
  )

  if ($Body -eq $null) {
    return Invoke-RestMethod -Uri $Uri -Method $Method -TimeoutSec 2
  }

  return Invoke-RestMethod `
    -Uri $Uri `
    -Method $Method `
    -ContentType "application/json" `
    -Body ($Body | ConvertTo-Json -Depth 8) `
    -TimeoutSec 2
}

# The HUD used to leave no trace at all -- hud-settings.json only records where the
# window sits, and only when it moves. These rows are what make "was the HUD open?"
# a question the data can answer. Best effort on purpose: a HUD that cannot reach
# the server is still a working HUD, so a failed log never surfaces to the user.
function Write-HudLog {
  param(
    [string]$Kind,
    [object]$DurationSeconds = $null,
    [string]$TaskId = ""
  )
  try {
    $payload = @{
      date = $Date
      kind = $Kind
      sessionId = $script:hudSessionId
    }
    if ($DurationSeconds -ne $null) { $payload.durationSeconds = [int]$DurationSeconds }
    if ($TaskId) { $payload.taskId = $TaskId }
    Invoke-JsonRequest -Uri "$baseUrl/api/hud-log" -Method "POST" -Body $payload | Out-Null
  } catch {
    # Logging is never worth interrupting the HUD for.
  }
}

function Get-RightNowTasks {
  $data = Invoke-JsonRequest -Uri "$baseUrl/api/tasks?date=$Date"
  $tasks = @($data.tasks.rightNow | Where-Object { $_ -and $_.text })
  # Same order the app renders: P1 tier first through P4, stored order inside a
  # tier, so the HUD's current task matches the top of the app's list.
  $index = 0
  $wrapped = foreach ($task in $tasks) {
    $rank = 4
    if ($task.priority -match '^p([1-4])$') { $rank = [int]$Matches[1] }
    [pscustomobject]@{ Task = $task; Rank = $rank; Index = $index }
    $index += 1
  }
  return @($wrapped | Sort-Object Rank, Index | ForEach-Object { $_.Task })
}

function Get-TaskSignature {
  param([object[]]$Tasks, [string]$State)
  $parts = @($State)
  foreach ($task in $Tasks) {
    $parts += ("{0}|{1}" -f $task.id, $task.text)
  }
  return ($parts -join "`n")
}

function New-HudCheckMark {
  $viewbox = New-Object System.Windows.Controls.Viewbox
  $viewbox.Width = 13
  $viewbox.Height = 13
  $path = New-Object System.Windows.Shapes.Path
  $path.Stroke = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#F7FFFB"))
  $path.StrokeThickness = 2.8
  $path.StrokeStartLineCap = [System.Windows.Media.PenLineCap]::Round
  $path.StrokeEndLineCap = [System.Windows.Media.PenLineCap]::Round
  $path.StrokeLineJoin = [System.Windows.Media.PenLineJoin]::Round
  $path.Data = [System.Windows.Media.Geometry]::Parse("M 2 7.5 L 6 11.5 L 13 3")
  $viewbox.Child = $path
  return $viewbox
}

function New-TaskRow {
  param(
    [object]$TaskEntry,
    [bool]$IsCurrent,
    [string]$StatusText = ""
  )

  $row = New-Object System.Windows.Controls.DockPanel
  $row.LastChildFill = $true
  $row.Margin = New-Object System.Windows.Thickness(0, 2, 0, 2)

  $button = New-Object System.Windows.Controls.Button
  $button.Style = $window.FindResource("HudButton")
  $accent = "#278551"
  if (-not $IsCurrent) { $accent = "#33524B" }
  $button.Background = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString($accent))
  $button.Content = New-HudCheckMark
  $button.VerticalAlignment = [System.Windows.VerticalAlignment]::Center
  [System.Windows.Controls.DockPanel]::SetDock($button, [System.Windows.Controls.Dock]::Left)

  $label = New-Object System.Windows.Controls.TextBlock
  $label.VerticalAlignment = [System.Windows.VerticalAlignment]::Center
  $label.Margin = New-Object System.Windows.Thickness(10, 0, 0, 0)
  $label.FontFamily = New-Object System.Windows.Media.FontFamily("Segoe UI")
  $label.TextWrapping = [System.Windows.TextWrapping]::Wrap
  $label.TextTrimming = [System.Windows.TextTrimming]::WordEllipsis
  $label.LineStackingStrategy = [System.Windows.LineStackingStrategy]::BlockLineHeight
  [System.Windows.Media.TextOptions]::SetTextFormattingMode($label, [System.Windows.Media.TextFormattingMode]::Ideal)
  [System.Windows.Media.TextOptions]::SetTextRenderingMode($label, [System.Windows.Media.TextRenderingMode]::ClearType)

  if ($StatusText) {
    $button.Visibility = [System.Windows.Visibility]::Collapsed
    $label.Text = $StatusText
    $label.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#C9D8D4"))
    $label.Opacity = 0.8
  } else {
    $button.Tag = $TaskEntry
    $button.Add_Click({
      param($sender, $event)
      Complete-Task -TaskEntry $sender.Tag -SourceButton $sender
    })
    $label.Text = [string]$TaskEntry.text
    if ($IsCurrent) {
      $label.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#F2FBF8"))
    } else {
      $label.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#C9D8D4"))
    }
  }

  [void]$row.Children.Add($button)
  [void]$row.Children.Add($label)
  return $row
}

function Rebuild-TaskRows {
  param([object[]]$Tasks, [string]$State)

  $taskRows.Children.Clear()
  if ($State -ne "ok" -or $Tasks.Count -eq 0) {
    $statusText = "Current task: nothing queued"
    if ($State -eq "offline") { $statusText = "Current task: sync paused" }
    [void]$taskRows.Children.Add((New-TaskRow -TaskEntry $null -IsCurrent $false -StatusText $statusText))
  } else {
    $visible = @($Tasks | Select-Object -First $script:maxVisibleTasks)
    for ($i = 0; $i -lt $visible.Count; $i += 1) {
      [void]$taskRows.Children.Add((New-TaskRow -TaskEntry $visible[$i] -IsCurrent ($i -eq 0)))
    }
    $hidden = $Tasks.Count - $visible.Count
    if ($hidden -gt 0) {
      $more = New-Object System.Windows.Controls.TextBlock
      $more.Text = "+$hidden more in Right Now"
      $more.FontFamily = New-Object System.Windows.Media.FontFamily("Segoe UI")
      $more.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#9FB4AF"))
      $more.Margin = New-Object System.Windows.Thickness(8, 0, 0, 2)
      [void]$taskRows.Children.Add($more)
    }
  }
  Apply-HudScale
  Update-HudHeight
}

# Only the rule of the day rides in the HUD. Daily habits deliberately do not:
# they belong in the night survey (where several are already measured) and in the
# task inbox as recurring items, not stacked on top of the Right Now list.
function Get-HudGoals {
  return Invoke-JsonRequest -Uri "$baseUrl/api/hud-goals?date=$Date"
}

function Get-GoalSignature {
  param([object]$Goals)
  if (-not $Goals -or -not $Goals.rule) { return "none" }
  return ("rule|{0}" -f $Goals.rule.title)
}

function Rebuild-GoalRows {
  param([object]$Goals)

  if ($Goals -and $Goals.rule) {
    $ruleLine.Text = [string]$Goals.rule.title
    $ruleLine.Visibility = [System.Windows.Visibility]::Visible
  } else {
    $ruleLine.Visibility = [System.Windows.Visibility]::Collapsed
  }
}

function Refresh-Hud {
  $tasks = @()
  $state = "empty"
  try {
    # @() is required: a one-task result unrolls to a bare PSCustomObject with no .Count in PS 5.1.
    $tasks = @(Get-RightNowTasks)
    if ($tasks.Count -gt 0) { $state = "ok" }
    $script:hudPolled = $true
  } catch {
    $state = "offline"
  }

  # A failed poll is nearly always a blip -- a restarted server, a request that
  # ran past the two-second timeout -- and the only trace of it anyone sees is
  # the rows swapping to "sync paused" and back. Once a poll has landed, what is
  # on screen stays exactly as it is until the server has something new to say;
  # the placeholder is only for a HUD that has never had data.
  if ($state -eq "offline" -and $script:hudPolled) { return }

  $goals = $null
  try {
    $goals = Get-HudGoals
  } catch {
    # Same reasoning: keep the rule line rather than blanking it on one failure.
    $goals = $script:lastGoals
  }

  $signature = Get-TaskSignature -Tasks $tasks -State $state
  $goalSig = Get-GoalSignature -Goals $goals
  $script:hudState = $state
  if ($signature -eq $script:taskSignature -and $goalSig -eq $script:goalSignature) { return }
  $script:taskSignature = $signature
  $script:goalSignature = $goalSig
  $script:hudTasks = $tasks
  $script:lastGoals = $goals
  Rebuild-GoalRows -Goals $goals
  Rebuild-TaskRows -Tasks $tasks -State $state
}

function Complete-Task {
  param([object]$TaskEntry, [object]$SourceButton)
  if (-not $TaskEntry -or -not $TaskEntry.id) { return }
  try {
    if ($SourceButton) { $SourceButton.IsEnabled = $false }
    Invoke-JsonRequest `
      -Uri "$baseUrl/api/tasks/complete" `
      -Method "POST" `
      -Body @{
        date = $Date
        section = "rightNow"
        taskId = $TaskEntry.id
        via = "hud"
      } | Out-Null
    Write-HudLog -Kind "complete" -TaskId $TaskEntry.id
    Start-Celebration -SourceButton $SourceButton
  } catch {
    # The refresh below no longer rebuilds the rows while the server is
    # unreachable, so hand the button back rather than leaving the row dead.
    if ($SourceButton) { $SourceButton.IsEnabled = $true }
  }
  $script:taskSignature = $null
  Refresh-Hud
}

function Undo-CompletedTask {
  try {
    Invoke-JsonRequest `
      -Uri "$baseUrl/api/tasks/undo" `
      -Method "POST" `
      -Body @{ date = $Date } | Out-Null
    Write-HudLog -Kind "undo"
  } catch {
    # Refresh below restores the real state either way.
  }
  $script:taskSignature = $null
  Refresh-Hud
}

function Get-HudSettings {
  try {
    if (Test-Path -LiteralPath $settingsPath) {
      return Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json
    }
  } catch {
    return $null
  }
  return $null
}

function Save-HudSettings {
  try {
    @{
      width = [int]$window.Width
      rowHeight = [int](Get-HudMetrics).RowHeight
      maxVisibleTasks = [int]$script:maxVisibleTasks
      left = [int]$window.Left
      top = [int]$window.Top
      savedAt = (Get-Date).ToString("o")
    } | ConvertTo-Json | Set-Content -LiteralPath $settingsPath -Encoding UTF8
  } catch {
    # HUD layout persistence is best effort.
  }
}

function Schedule-HudSettingsSave {
  if ($script:saveLayoutTimer -eq $null) {
    $script:saveLayoutTimer = New-Object System.Windows.Threading.DispatcherTimer
    $script:saveLayoutTimer.Interval = [TimeSpan]::FromMilliseconds(400)
    $script:saveLayoutTimer.Add_Tick({
      $script:saveLayoutTimer.Stop()
      Save-HudSettings
    })
  }
  $script:saveLayoutTimer.Stop()
  $script:saveLayoutTimer.Start()
}

function Update-RowCountLabel {
  if ($rowCountLabel -eq $null) { return }
  $rowCountLabel.Text = [string]$script:maxVisibleTasks
  $lessEnabled = $script:maxVisibleTasks -gt $script:minVisibleTasks
  $moreEnabled = $script:maxVisibleTasks -lt $script:maxVisibleTasksLimit
  if ($rowCountLessButton -ne $null) {
    $rowCountLessButton.IsEnabled = $lessEnabled
    $rowCountLessButton.Opacity = if ($lessEnabled) { 1 } else { 0.35 }
  }
  if ($rowCountMoreButton -ne $null) {
    $rowCountMoreButton.IsEnabled = $moreEnabled
    $rowCountMoreButton.Opacity = if ($moreEnabled) { 1 } else { 0.35 }
  }
}

# The header shows only the menu button; opening it reveals the row-count
# stepper and the close X, which otherwise take no space.
function Set-HudMenuOpen {
  param([bool]$Open)
  $script:hudMenuOpen = $Open
  $vis = if ($Open) { [System.Windows.Visibility]::Visible } else { [System.Windows.Visibility]::Collapsed }
  $rowCountPanel.Visibility = $vis
  $closeButton.Visibility = $vis
}

function Adjust-VisibleTaskCount {
  param([int]$Delta)
  $next = [Math]::Min($script:maxVisibleTasksLimit, [Math]::Max($script:minVisibleTasks, $script:maxVisibleTasks + $Delta))
  if ($next -eq $script:maxVisibleTasks) { return }
  $script:maxVisibleTasks = $next
  Update-RowCountLabel
  # Rebuild from the cached list so changing the count does not wait for the poll.
  Rebuild-TaskRows -Tasks $script:hudTasks -State $script:hudState
  Schedule-HudSettingsSave
}

function Get-HudMetrics {
  $rowHeight = [Math]::Min(110, [Math]::Max(32, [double]$script:rowHeight))
  $outerPadding = [Math]::Min(10, [Math]::Max(4, [Math]::Round($rowHeight * 0.12)))
  # Text size is deliberately constant: resizing the HUD changes row spacing and
  # button size, not how big the words are.
  $fontSize = 13
  $innerRowHeight = [Math]::Max(18, $rowHeight - ($outerPadding * 2) - 12)
  return [PSCustomObject]@{
    RowHeight = $rowHeight
    OuterPadding = $outerPadding
    FontSize = $fontSize
    InnerRowHeight = $innerRowHeight
    ButtonSize = [Math]::Min(34, [Math]::Max(18, [Math]::Round($innerRowHeight - 2)))
    CornerRadius = [Math]::Min(22, [Math]::Max(12, [Math]::Round($rowHeight / 2)))
    ChromeHeight = ($outerPadding * 2) + 14
  }
}

function Apply-HudScale {
  $m = Get-HudMetrics
  $shell.Margin = New-Object System.Windows.Thickness($m.OuterPadding)
  $shell.CornerRadius = New-Object System.Windows.CornerRadius($m.CornerRadius)
  foreach ($row in @($taskRows.Children)) {
    if ($row -is [System.Windows.Controls.DockPanel]) {
      $button = $row.Children[0]
      $label = $row.Children[1]
      $button.Width = $m.ButtonSize
      $button.Height = $m.ButtonSize
      if ($button.Content -is [System.Windows.Controls.Viewbox]) {
        $button.Content.Width = [Math]::Max(9, [Math]::Round($m.ButtonSize * 0.44))
        $button.Content.Height = $button.Content.Width
      }
      $label.FontSize = $m.FontSize
      $lineHeight = [Math]::Round($m.FontSize * 1.35, 1)
      $label.LineHeight = $lineHeight
      # Clip to whole lines only. A MaxHeight that lands mid-line leaves a half-drawn row of
      # text instead of the word ellipsis, because trimming applies per line, not per pixel.
      $visibleLines = [Math]::Max(1, [Math]::Floor($m.InnerRowHeight / $lineHeight))
      $label.MaxHeight = $visibleLines * $lineHeight
      $row.Height = $m.InnerRowHeight
    } elseif ($row -is [System.Windows.Controls.TextBlock]) {
      $row.FontSize = [Math]::Max(9, $m.FontSize - 1)
    }
  }
  $ruleLine.FontSize = [Math]::Max(9, $m.FontSize - 0.5)
  $resizeGrip.Width = [Math]::Min(16, [Math]::Max(10, [Math]::Round($m.RowHeight * 0.42)))
  $resizeGrip.Height = $resizeGrip.Width
}

function Get-HudRowCounts {
  $m = Get-HudMetrics
  $rowCount = 0
  $moreExtra = 0
  foreach ($row in @($taskRows.Children)) {
    if ($row -is [System.Windows.Controls.DockPanel]) {
      $rowCount += 1
    } elseif ($row -is [System.Windows.Controls.TextBlock]) {
      $moreExtra = $m.FontSize + 10
    }
  }
  if ($rowCount -lt 1) { $rowCount = 1 }
  return [PSCustomObject]@{ RowCount = $rowCount; MoreExtra = $moreExtra }
}

function Get-GoalStripHeight {
  if ($ruleLine.Visibility -ne [System.Windows.Visibility]::Visible) { return 0 }
  $m = Get-HudMetrics
  return [Math]::Round($m.FontSize * 1.45) + 3
}

function Get-HudContentHeight {
  $m = Get-HudMetrics
  $counts = Get-HudRowCounts
  return $m.ChromeHeight + ($counts.RowCount * ($m.InnerRowHeight + 4)) + $counts.MoreExtra + (Get-GoalStripHeight)
}

function Update-HudHeight {
  $target = Get-HudContentHeight
  $script:targetHeight = $target
  $window.Height = $target
}

function Start-ResizeBottomRight {
  $helper = New-Object System.Windows.Interop.WindowInteropHelper($window)
  [HudWindowNative]::ReleaseCapture() | Out-Null
  [HudWindowNative]::SendMessage($helper.Handle, 0xA1, 0x11, 0) | Out-Null
}

function Hide-WindowFromAltTab {
  param(
    [System.Windows.Window]$TargetWindow,
    [bool]$NoActivate = $false
  )
  try {
    $helper = New-Object System.Windows.Interop.WindowInteropHelper($TargetWindow)
    $handle = $helper.Handle
    if ($handle -eq [IntPtr]::Zero) {
      $handle = $helper.EnsureHandle()
    }
    [HudWindowNative]::HideFromAltTab($handle, $NoActivate)
  } catch {
    # If native style tweaks fail, the HUD still works normally.
  }
}

function Show-WindowInAltTab {
  param(
    [System.Windows.Window]$TargetWindow
  )
  try {
    $helper = New-Object System.Windows.Interop.WindowInteropHelper($TargetWindow)
    $handle = $helper.Handle
    if ($handle -eq [IntPtr]::Zero) {
      $handle = $helper.EnsureHandle()
    }
    [HudWindowNative]::ShowInAltTab($handle)
  } catch {
    # If native style tweaks fail, the HUD still works normally.
  }
}

function New-HudCheckIconSource {
  try {
    $group = New-Object System.Windows.Media.DrawingGroup

    $circle = New-Object System.Windows.Media.GeometryDrawing
    $circle.Brush = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.Color]::FromRgb(39, 133, 81))
    $circle.Geometry = New-Object System.Windows.Media.EllipseGeometry(
      [System.Windows.Point]::new(16, 16),
      15,
      15
    )
    $group.Children.Add($circle)

    $checkGeometry = New-Object System.Windows.Media.StreamGeometry
    $context = $checkGeometry.Open()
    $context.BeginFigure([System.Windows.Point]::new(7, 16), $false, $false)
    $context.LineTo([System.Windows.Point]::new(13, 22), $true, $false)
    $context.LineTo([System.Windows.Point]::new(25, 10), $true, $false)
    $context.Close()
    $checkGeometry.Freeze()

    $check = New-Object System.Windows.Media.GeometryDrawing
    $check.Geometry = $checkGeometry
    $check.Pen = New-Object System.Windows.Media.Pen(
      (New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.Color]::FromRgb(247, 255, 251))),
      4
    )
    $check.Pen.StartLineCap = [System.Windows.Media.PenLineCap]::Round
    $check.Pen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
    $check.Pen.LineJoin = [System.Windows.Media.PenLineJoin]::Round
    $group.Children.Add($check)

    $image = New-Object System.Windows.Media.DrawingImage($group)
    $image.Freeze()
    return $image
  } catch {
    return $null
  }
}

function Show-HudWindow {
  try {
    $window.Show()
    $window.WindowState = [System.Windows.WindowState]::Normal
    $window.Topmost = $true
    $window.Activate() | Out-Null
    Hide-WindowFromAltTab -TargetWindow $window -NoActivate $false
    Write-HudLog -Kind "show"
  } catch {
    # Tray restore is best effort.
  }
}

function Hide-HudWindow {
  try {
    $window.Hide()
    Write-HudLog -Kind "hide"
  } catch {
    # Tray minimize is best effort.
  }
}

function Initialize-HudTray {
  if ($script:trayIcon -ne $null) { return }
  try {
    $script:trayIcon = New-Object System.Windows.Forms.NotifyIcon
    $script:trayIcon.Icon = [System.Drawing.SystemIcons]::Application
    $script:trayIcon.Text = "Event Horizon HUD"
    $script:trayIcon.Visible = $true

    $menu = New-Object System.Windows.Forms.ContextMenuStrip
    $showItem = $menu.Items.Add("Show HUD")
    $hideItem = $menu.Items.Add("Hide HUD")
    $exitItem = $menu.Items.Add("Exit HUD")

    $showItem.Add_Click({ Show-HudWindow })
    $hideItem.Add_Click({ Hide-HudWindow })
    $exitItem.Add_Click({
      $script:isClosingFromTray = $true
      if ($script:trayIcon) { $script:trayIcon.Visible = $false }
      $window.Close()
    })

    $script:trayIcon.ContextMenuStrip = $menu
    $script:trayIcon.Add_MouseClick({
      param($sender, $event)
      if ($event.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        if ($window.IsVisible -and $window.WindowState -ne [System.Windows.WindowState]::Minimized) {
          Hide-HudWindow
        } else {
          Show-HudWindow
        }
      }
    })
    $script:trayIcon.Add_DoubleClick({ Show-HudWindow })
  } catch {
    # If the tray icon cannot be created, the HUD still works as a normal window.
  }
}

# ---------------------------------------------------------------------------
# Celebrations
#
# Every celebration draws into a throwaway full-screen transparent overlay
# window. Everything is vector geometry on purpose: WPF and GDI both render
# color emoji as flat black glyphs, so ðŸ”¥-style art has to be drawn by hand.
# ---------------------------------------------------------------------------

# A transparent full-screen window is a per-pixel-alpha layered window, which
# forces WPF into software rendering: every frame recomposes the whole screen on
# the CPU. So the rules for anything in here are: share and freeze brushes,
# never use blur effects, cap the frame rate, and keep element counts modest.
$script:celebrationFrameRate = 30
$script:celebrationBrushCache = @{}
$script:celebrationGeometryCache = @{}

function New-CelebrationBrush {
  param([string]$Hex)
  if (-not $script:celebrationBrushCache.ContainsKey($Hex)) {
    $brush = New-Object System.Windows.Media.SolidColorBrush(
      [System.Windows.Media.ColorConverter]::ConvertFromString($Hex)
    )
    $brush.Freeze()
    $script:celebrationBrushCache[$Hex] = $brush
  }
  return $script:celebrationBrushCache[$Hex]
}

function New-CelebrationGradient {
  param([string[]]$Stops)
  $key = "linear|" + ($Stops -join ",")
  if (-not $script:celebrationBrushCache.ContainsKey($key)) {
    $brush = New-Object System.Windows.Media.LinearGradientBrush
    $brush.StartPoint = New-Object System.Windows.Point(0.5, 0)
    $brush.EndPoint = New-Object System.Windows.Point(0.5, 1)
    for ($i = 0; $i -lt $Stops.Count; $i += 1) {
      $offset = 0
      if ($Stops.Count -gt 1) { $offset = $i / ($Stops.Count - 1) }
      $brush.GradientStops.Add((New-Object System.Windows.Media.GradientStop(
        [System.Windows.Media.ColorConverter]::ConvertFromString($Stops[$i]), $offset
      )))
    }
    $brush.Freeze()
    $script:celebrationBrushCache[$key] = $brush
  }
  return $script:celebrationBrushCache[$key]
}

function New-CelebrationRadialBrush {
  param([string]$Inner, [string]$Outer, [double]$OriginX = 0.5, [double]$OriginY = 0.5)
  $key = "radial|$Inner|$Outer|$OriginX|$OriginY"
  if (-not $script:celebrationBrushCache.ContainsKey($key)) {
    $brush = New-Object System.Windows.Media.RadialGradientBrush
    $brush.GradientOrigin = New-Object System.Windows.Point($OriginX, $OriginY)
    $brush.Center = New-Object System.Windows.Point(0.5, 0.5)
    $brush.GradientStops.Add((New-Object System.Windows.Media.GradientStop(
      [System.Windows.Media.ColorConverter]::ConvertFromString($Inner), 0
    )))
    $brush.GradientStops.Add((New-Object System.Windows.Media.GradientStop(
      [System.Windows.Media.ColorConverter]::ConvertFromString($Outer), 1
    )))
    $brush.Freeze()
    $script:celebrationBrushCache[$key] = $brush
  }
  return $script:celebrationBrushCache[$key]
}

function Get-CelebrationGeometry {
  param([string]$Data)
  if (-not $script:celebrationGeometryCache.ContainsKey($Data)) {
    $geometry = [System.Windows.Media.Geometry]::Parse($Data)
    $geometry.Freeze()
    $script:celebrationGeometryCache[$Data] = $geometry
  }
  return $script:celebrationGeometryCache[$Data]
}

# Rasterize a vector visual once, then reuse it while it moves and spins.
function Set-CelebrationCache {
  param([object]$Element)
  $Element.CacheMode = New-Object System.Windows.Media.BitmapCache
}

function New-CelebrationEase {
  param([string]$Kind = "Cubic", [string]$Mode = "Out", [double]$Amplitude = -1)
  $ease = $null
  switch ($Kind) {
    "Sine" { $ease = New-Object System.Windows.Media.Animation.SineEase }
    "Quad" { $ease = New-Object System.Windows.Media.Animation.QuadraticEase }
    "Quart" { $ease = New-Object System.Windows.Media.Animation.QuarticEase }
    "Back" {
      $ease = New-Object System.Windows.Media.Animation.BackEase
      if ($Amplitude -ge 0) { $ease.Amplitude = $Amplitude }
    }
    "Elastic" {
      $ease = New-Object System.Windows.Media.Animation.ElasticEase
      $ease.Oscillations = 2
      $ease.Springiness = 4
    }
    "Bounce" {
      $ease = New-Object System.Windows.Media.Animation.BounceEase
      $ease.Bounces = 3
      $ease.Bounciness = 2
    }
    default { $ease = New-Object System.Windows.Media.Animation.CubicEase }
  }
  $ease.EasingMode = [System.Windows.Media.Animation.EasingMode]("Ease" + $Mode)
  return $ease
}

function New-CelebrationAnim {
  param(
    [double]$From,
    [double]$To,
    [int]$DurationMs,
    [int]$BeginMs = 0,
    [object]$Ease = $null,
    [switch]$AutoReverse,
    [switch]$Forever
  )
  $anim = New-Object System.Windows.Media.Animation.DoubleAnimation
  $anim.From = $From
  $anim.To = $To
  $anim.Duration = New-Object System.Windows.Duration([TimeSpan]::FromMilliseconds($DurationMs))
  if ($BeginMs -gt 0) { $anim.BeginTime = [TimeSpan]::FromMilliseconds($BeginMs) }
  if ($Ease) { $anim.EasingFunction = $Ease }
  if ($AutoReverse) { $anim.AutoReverse = $true }
  if ($Forever) { $anim.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever }
  [System.Windows.Media.Animation.Timeline]::SetDesiredFrameRate($anim, $script:celebrationFrameRate)
  return $anim
}

function New-CelebrationArcAnim {
  param([double]$Apex, [double]$To, [int]$DurationMs, [int]$BeginMs = 0)
  $anim = New-Object System.Windows.Media.Animation.DoubleAnimationUsingKeyFrames
  $anim.Duration = New-Object System.Windows.Duration([TimeSpan]::FromMilliseconds($DurationMs))
  if ($BeginMs -gt 0) { $anim.BeginTime = [TimeSpan]::FromMilliseconds($BeginMs) }
  $up = New-Object System.Windows.Media.Animation.EasingDoubleKeyFrame(
    $Apex, [System.Windows.Media.Animation.KeyTime]::FromPercent(0.34)
  )
  $up.EasingFunction = New-CelebrationEase -Kind "Quad" -Mode "Out"
  $down = New-Object System.Windows.Media.Animation.EasingDoubleKeyFrame(
    $To, [System.Windows.Media.Animation.KeyTime]::FromPercent(1)
  )
  $down.EasingFunction = New-CelebrationEase -Kind "Quad" -Mode "In"
  [void]$anim.KeyFrames.Add($up)
  [void]$anim.KeyFrames.Add($down)
  [System.Windows.Media.Animation.Timeline]::SetDesiredFrameRate($anim, $script:celebrationFrameRate)
  return $anim
}

# BeginAnimation replaces any prior animation on the same property, so anything
# with more than one leg (fade in then out, roll in then fly off) has to be a
# single keyframe animation. Frames: @{ Value; TimeMs; Ease }.
function New-CelebrationKeyAnim {
  param([object[]]$Frames, [int]$BeginMs = 0)
  $anim = New-Object System.Windows.Media.Animation.DoubleAnimationUsingKeyFrames
  $total = $Frames[$Frames.Count - 1].TimeMs
  $anim.Duration = New-Object System.Windows.Duration([TimeSpan]::FromMilliseconds($total))
  if ($BeginMs -gt 0) { $anim.BeginTime = [TimeSpan]::FromMilliseconds($BeginMs) }
  foreach ($frame in $Frames) {
    $key = New-Object System.Windows.Media.Animation.EasingDoubleKeyFrame(
      [double]$frame.Value,
      [System.Windows.Media.Animation.KeyTime]::FromTimeSpan([TimeSpan]::FromMilliseconds($frame.TimeMs))
    )
    if ($frame.Ease) { $key.EasingFunction = $frame.Ease }
    [void]$anim.KeyFrames.Add($key)
  }
  [System.Windows.Media.Animation.Timeline]::SetDesiredFrameRate($anim, $script:celebrationFrameRate)
  return $anim
}

function Move-CelebrationElement {
  param(
    [object]$Element,
    [double]$FromX, [double]$FromY,
    [double]$ToX, [double]$ToY,
    [int]$DurationMs,
    [int]$BeginMs = 0,
    [object]$EaseX = $null,
    [object]$EaseY = $null
  )
  $Element.BeginAnimation(
    [System.Windows.Controls.Canvas]::LeftProperty,
    (New-CelebrationAnim -From $FromX -To $ToX -DurationMs $DurationMs -BeginMs $BeginMs -Ease $EaseX)
  )
  $Element.BeginAnimation(
    [System.Windows.Controls.Canvas]::TopProperty,
    (New-CelebrationAnim -From $FromY -To $ToY -DurationMs $DurationMs -BeginMs $BeginMs -Ease $EaseY)
  )
}

function Set-CelebrationFade {
  param([object]$Element, [double]$From = 1, [double]$To = 0, [int]$DurationMs = 600, [int]$BeginMs = 0)
  $Element.BeginAnimation(
    [System.Windows.UIElement]::OpacityProperty,
    (New-CelebrationAnim -From $From -To $To -DurationMs $DurationMs -BeginMs $BeginMs)
  )
}

function Add-CelebrationChild {
  param([object]$Canvas, [object]$Element, [double]$X, [double]$Y, [switch]$CenterX)
  if ($CenterX) {
    $Element.Measure((New-Object System.Windows.Size([double]::PositiveInfinity, [double]::PositiveInfinity)))
    $X = $X - ($Element.DesiredSize.Width / 2)
  }
  [System.Windows.Controls.Canvas]::SetLeft($Element, $X)
  [System.Windows.Controls.Canvas]::SetTop($Element, $Y)
  [void]$Canvas.Children.Add($Element)
  return $X
}

function New-CelebrationText {
  param(
    [string]$Text,
    [double]$FontSize,
    [string]$Color = "#FFFFFF",
    [string]$Glow = "#000000",
    [string]$Family = "Segoe UI Black"
  )
  $block = New-Object System.Windows.Controls.TextBlock
  $block.Text = $Text
  $block.FontSize = $FontSize
  $block.FontFamily = New-Object System.Windows.Media.FontFamily($Family)
  $block.FontWeight = [System.Windows.FontWeights]::Black
  $block.Foreground = New-CelebrationBrush $Color
  # WPF has no text stroke; a tight zero-depth shadow fakes the outline.
  $effect = New-Object System.Windows.Media.Effects.DropShadowEffect
  $effect.Color = [System.Windows.Media.ColorConverter]::ConvertFromString($Glow)
  $effect.BlurRadius = 16
  $effect.ShadowDepth = 0
  $effect.Opacity = 1
  $block.Effect = $effect
  $block.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
  # The glow is the one blur left in a celebration; cache it so it rasterizes
  # once instead of on every frame of the pop-in.
  Set-CelebrationCache -Element $block
  return $block
}

# Pops a headline in with a slight overshoot, holds, then fades.
function Add-CelebrationHeadline {
  param(
    [object]$Context,
    [string]$Text,
    [double]$FontSize,
    [string]$Color,
    [string]$Glow,
    [string]$Family = "Segoe UI Black",
    [double]$CenterX,
    [double]$Y,
    [int]$BeginMs = 0,
    [int]$HoldMs = 900
  )
  $block = New-CelebrationText -Text $Text -FontSize $FontSize -Color $Color -Glow $Glow -Family $Family
  $block.Opacity = 0

  # Shrink to fit narrow screens rather than running off both edges.
  $maxWidth = $Context.Screen.Width * 0.84
  $block.Measure((New-Object System.Windows.Size([double]::PositiveInfinity, [double]::PositiveInfinity)))
  if ($block.DesiredSize.Width -gt $maxWidth) {
    $block.FontSize = [Math]::Max(22, $FontSize * ($maxWidth / $block.DesiredSize.Width))
  }
  [void](Add-CelebrationChild -Canvas $Context.Canvas -Element $block -X $CenterX -Y $Y -CenterX)

  $scale = New-Object System.Windows.Media.ScaleTransform(0.4, 0.4)
  $block.RenderTransform = $scale
  $ease = New-CelebrationEase -Kind "Back" -Mode "Out" -Amplitude 0.9
  $scale.BeginAnimation(
    [System.Windows.Media.ScaleTransform]::ScaleXProperty,
    (New-CelebrationAnim -From 0.4 -To 1 -DurationMs 420 -BeginMs $BeginMs -Ease $ease)
  )
  $scale.BeginAnimation(
    [System.Windows.Media.ScaleTransform]::ScaleYProperty,
    (New-CelebrationAnim -From 0.4 -To 1 -DurationMs 420 -BeginMs $BeginMs -Ease $ease)
  )
  $block.BeginAnimation(
    [System.Windows.UIElement]::OpacityProperty,
    (New-CelebrationKeyAnim -BeginMs $BeginMs -Frames @(
      @{ Value = 1; TimeMs = 180 },
      @{ Value = 1; TimeMs = (420 + $HoldMs) },
      @{ Value = 0; TimeMs = (420 + $HoldMs + 420) }
    ))
  )
  return $block
}

function New-CelebrationOverlay {
  $screen = [pscustomobject]@{
    Width  = [System.Windows.SystemParameters]::VirtualScreenWidth
    Height = [System.Windows.SystemParameters]::VirtualScreenHeight
    Left   = [System.Windows.SystemParameters]::VirtualScreenLeft
    Top    = [System.Windows.SystemParameters]::VirtualScreenTop
  }

  $overlay = New-Object System.Windows.Window
  $overlay.WindowStyle = [System.Windows.WindowStyle]::None
  $overlay.AllowsTransparency = $true
  $overlay.Background = [System.Windows.Media.Brushes]::Transparent
  $overlay.Topmost = $true
  $overlay.ShowInTaskbar = $false
  $overlay.ShowActivated = $false
  $overlay.ResizeMode = [System.Windows.ResizeMode]::NoResize
  $overlay.Left = $screen.Left
  $overlay.Top = $screen.Top
  $overlay.Width = $screen.Width
  $overlay.Height = $screen.Height
  $overlay.IsHitTestVisible = $false
  $overlay.Focusable = $false

  $canvas = New-Object System.Windows.Controls.Canvas
  $canvas.Background = [System.Windows.Media.Brushes]::Transparent
  $overlay.Content = $canvas
  try { $overlay.Owner = $window } catch {}
  $overlay.Add_SourceInitialized({ Hide-WindowFromAltTab -TargetWindow $overlay -NoActivate $true })
  [void]$overlay.Show()
  Hide-WindowFromAltTab -TargetWindow $overlay -NoActivate $true

  return [pscustomobject]@{
    Overlay = $overlay
    Canvas  = $canvas
    Screen  = $screen
  }
}

function Close-CelebrationOverlay {
  param([object]$Context, [int]$AfterMs)
  # Each overlay owns its own timer; a second celebration fired mid-animation
  # must not orphan the first overlay on screen.
  $timer = New-Object System.Windows.Threading.DispatcherTimer
  $timer.Interval = [TimeSpan]::FromMilliseconds($AfterMs)
  # GetNewClosure captures locals only: inside the closure `$script:` resolves
  # to its own module scope, so the timer list has to come in as a local.
  $registry = $script:celebrationTimers
  $timer.Add_Tick({
    $timer.Stop()
    [void]$registry.Remove($timer)
    try { $Context.Overlay.Close() } catch {}
  }.GetNewClosure())
  [void]$script:celebrationTimers.Add($timer)
  $timer.Start()
}

function Get-CelebrationOrigin {
  param([object]$SourceButton, [object]$Context)
  $point = $null
  if ($SourceButton) {
    try {
      $point = $SourceButton.PointToScreen(
        [System.Windows.Point]::new(($SourceButton.ActualWidth / 2), ($SourceButton.ActualHeight / 2))
      )
    } catch {
      $point = $null
    }
  }
  if ($null -eq $point) {
    $point = $window.PointToScreen(
      [System.Windows.Point]::new(($window.ActualWidth / 2), ($window.ActualHeight / 2))
    )
  }
  return New-Object System.Windows.Point(
    ($point.X - $Context.Screen.Left),
    ($point.Y - $Context.Screen.Top)
  )
}

# --- shared vector art -----------------------------------------------------

$script:flameGeometry = "M 12,0 C 19,9 24,17 24,25 C 24,32.6 18.6,38 12,38 C 5.4,38 0,32.6 0,25 C 0,17 5,9 12,0 Z"
$script:pinGeometry = "M 10,0 C 13.3,0 15,2.6 15,5.2 C 15,7.8 12.8,9.4 12.8,11.4 C 12.8,14 20,19 20,30 C 20,39 15.5,46 10,46 C 4.5,46 0,39 0,30 C 0,19 7.2,14 7.2,11.4 C 7.2,9.4 5,7.8 5,5.2 C 5,2.6 6.7,0 10,0 Z"

# Returns a canvas whose RenderTransform children are [0] scale and [1] rotate.
function New-CelebrationVisual {
  param([double]$Width, [double]$Height, [double]$OriginY = 0.5)
  $visual = New-Object System.Windows.Controls.Canvas
  $visual.Width = $Width
  $visual.Height = $Height
  $visual.RenderTransformOrigin = New-Object System.Windows.Point(0.5, $OriginY)
  $group = New-Object System.Windows.Media.TransformGroup
  [void]$group.Children.Add((New-Object System.Windows.Media.ScaleTransform(1, 1)))
  [void]$group.Children.Add((New-Object System.Windows.Media.RotateTransform(0)))
  $visual.RenderTransform = $group
  return $visual
}

function New-FlameVisual {
  $visual = New-CelebrationVisual -Width 24 -Height 38 -OriginY 0.85

  # A soft halo instead of a DropShadowEffect: blur is per-pixel CPU work here.
  $halo = New-Object System.Windows.Shapes.Ellipse
  $halo.Width = 44
  $halo.Height = 52
  $halo.Fill = New-CelebrationRadialBrush -Inner "#66FF7A18" -Outer "#00FF7A18"
  [System.Windows.Controls.Canvas]::SetLeft($halo, -10)
  [System.Windows.Controls.Canvas]::SetTop($halo, -6)
  [void]$visual.Children.Add($halo)

  $outer = New-Object System.Windows.Shapes.Path
  $outer.Data = Get-CelebrationGeometry $script:flameGeometry
  $outer.Fill = New-CelebrationGradient -Stops @("#FF4B1F", "#FF8C1A", "#FFC93C")
  [void]$visual.Children.Add($outer)

  $inner = New-Object System.Windows.Shapes.Path
  $inner.Data = Get-CelebrationGeometry $script:flameGeometry
  $inner.Fill = New-CelebrationBrush "#FFF6C8"
  $inner.Opacity = 0.92
  $innerTransform = New-Object System.Windows.Media.TransformGroup
  [void]$innerTransform.Children.Add((New-Object System.Windows.Media.ScaleTransform(0.5, 0.5)))
  [void]$innerTransform.Children.Add((New-Object System.Windows.Media.TranslateTransform(6, 18)))
  $inner.RenderTransform = $innerTransform
  [void]$visual.Children.Add($inner)

  Set-CelebrationCache -Element $visual
  return $visual
}

function New-BowlingPinVisual {
  $visual = New-CelebrationVisual -Width 20 -Height 46 -OriginY 0.85

  $body = New-Object System.Windows.Shapes.Path
  $body.Data = Get-CelebrationGeometry $script:pinGeometry
  $body.Fill = New-CelebrationGradient -Stops @("#FFFFFF", "#F2F2F2", "#D2D2D2")
  $body.Stroke = New-CelebrationBrush "#A9A9A9"
  $body.StrokeThickness = 1
  [void]$visual.Children.Add($body)

  foreach ($stripeTop in @(15, 21)) {
    $stripe = New-Object System.Windows.Shapes.Rectangle
    $stripe.Width = 11
    $stripe.Height = 3.4
    $stripe.RadiusX = 1.6
    $stripe.RadiusY = 1.6
    $stripe.Fill = New-CelebrationBrush "#E53935"
    [System.Windows.Controls.Canvas]::SetLeft($stripe, 4.5)
    [System.Windows.Controls.Canvas]::SetTop($stripe, $stripeTop)
    [void]$visual.Children.Add($stripe)
  }

  Set-CelebrationCache -Element $visual
  return $visual
}

function New-BowlingBallVisual {
  param([double]$Size)
  $visual = New-CelebrationVisual -Width $Size -Height $Size

  $ball = New-Object System.Windows.Shapes.Ellipse
  $ball.Width = $Size
  $ball.Height = $Size
  $ball.Fill = New-CelebrationRadialBrush -Inner "#7C5CFF" -Outer "#150C2E" -OriginX 0.34 -OriginY 0.3
  [void]$visual.Children.Add($ball)

  $holes = @(@(0.40, 0.26), @(0.56, 0.30), @(0.47, 0.44))
  foreach ($hole in $holes) {
    $dot = New-Object System.Windows.Shapes.Ellipse
    $dot.Width = $Size * 0.11
    $dot.Height = $Size * 0.13
    $dot.Fill = New-CelebrationBrush "#0A0616"
    [System.Windows.Controls.Canvas]::SetLeft($dot, $Size * $hole[0])
    [System.Windows.Controls.Canvas]::SetTop($dot, $Size * $hole[1])
    [void]$visual.Children.Add($dot)
  }

  Set-CelebrationCache -Element $visual
  return $visual
}

function New-CoinVisual {
  param([double]$Size)
  $visual = New-CelebrationVisual -Width $Size -Height $Size

  $coin = New-Object System.Windows.Shapes.Ellipse
  $coin.Width = $Size
  $coin.Height = $Size
  $coin.Fill = New-CelebrationRadialBrush -Inner "#FFF3A8" -Outer "#D99A00" -OriginX 0.35 -OriginY 0.3
  $coin.Stroke = New-CelebrationBrush "#A9750B"
  $coin.StrokeThickness = 1.5
  [void]$visual.Children.Add($coin)

  $ring = New-Object System.Windows.Shapes.Ellipse
  $ring.Width = $Size * 0.6
  $ring.Height = $Size * 0.6
  $ring.Stroke = New-CelebrationBrush "#FFEFAE"
  $ring.StrokeThickness = 2
  [System.Windows.Controls.Canvas]::SetLeft($ring, $Size * 0.2)
  [System.Windows.Controls.Canvas]::SetTop($ring, $Size * 0.2)
  [void]$visual.Children.Add($ring)

  Set-CelebrationCache -Element $visual
  return $visual
}

function New-YellingBallVisual {
  param([double]$Size)
  $visual = New-CelebrationVisual -Width $Size -Height $Size

  $ball = New-Object System.Windows.Shapes.Ellipse
  $ball.Width = $Size
  $ball.Height = $Size
  $ball.Fill = New-CelebrationRadialBrush -Inner "#FFF07A" -Outer "#F0B400" -OriginX 0.35 -OriginY 0.28
  $ball.Stroke = New-CelebrationBrush "#C08A00"
  $ball.StrokeThickness = $Size * 0.015
  [void]$visual.Children.Add($ball)

  # Squinting eyes.
  foreach ($eyeX in @(0.28, 0.58)) {
    $eye = New-Object System.Windows.Shapes.Ellipse
    $eye.Width = $Size * 0.14
    $eye.Height = $Size * 0.19
    $eye.Fill = New-CelebrationBrush "#181008"
    [System.Windows.Controls.Canvas]::SetLeft($eye, $Size * $eyeX)
    [System.Windows.Controls.Canvas]::SetTop($eye, $Size * 0.26)
    [void]$visual.Children.Add($eye)
  }

  # Angled brows sell the yell.
  $browSpecs = @(@(0.24, 18), @(0.56, -18))
  foreach ($spec in $browSpecs) {
    $brow = New-Object System.Windows.Shapes.Rectangle
    $brow.Width = $Size * 0.2
    $brow.Height = $Size * 0.05
    $brow.RadiusX = $Size * 0.025
    $brow.RadiusY = $Size * 0.025
    $brow.Fill = New-CelebrationBrush "#181008"
    $brow.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
    $brow.RenderTransform = New-Object System.Windows.Media.RotateTransform($spec[1])
    [System.Windows.Controls.Canvas]::SetLeft($brow, $Size * $spec[0])
    [System.Windows.Controls.Canvas]::SetTop($brow, $Size * 0.19)
    [void]$visual.Children.Add($brow)
  }

  $mouth = New-Object System.Windows.Shapes.Ellipse
  $mouth.Width = $Size * 0.44
  $mouth.Height = $Size * 0.34
  $mouth.Fill = New-CelebrationBrush "#5E1010"
  [System.Windows.Controls.Canvas]::SetLeft($mouth, $Size * 0.28)
  [System.Windows.Controls.Canvas]::SetTop($mouth, $Size * 0.52)
  [void]$visual.Children.Add($mouth)

  $tongue = New-Object System.Windows.Shapes.Ellipse
  $tongue.Width = $Size * 0.24
  $tongue.Height = $Size * 0.13
  $tongue.Fill = New-CelebrationBrush "#D94F5C"
  [System.Windows.Controls.Canvas]::SetLeft($tongue, $Size * 0.38)
  [System.Windows.Controls.Canvas]::SetTop($tongue, $Size * 0.71)
  [void]$visual.Children.Add($tongue)

  return $visual
}

# --- celebrations ----------------------------------------------------------

function Show-ConfettiCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $screenWidth = $Context.Screen.Width
  $screenHeight = $Context.Screen.Height
  $palette = @("#6EE7B7", "#FDE68A", "#FCA5A5", "#93C5FD", "#C4B5FD", "#F9A8D4", "#FFFFFF")

  # Pieces live in two group layers so the fade-outs cost two animation clocks
  # instead of one per piece.
  $fallLayer = New-Object System.Windows.Controls.Canvas
  [void]$canvas.Children.Add($fallLayer)
  $burstLayer = New-Object System.Windows.Controls.Canvas
  [void]$canvas.Children.Add($burstLayer)

  for ($i = 0; $i -lt 105; $i += 1) {
    $piece = New-Object System.Windows.Shapes.Rectangle
    $piece.Width = $script:celebrationRandom.Next(9, 19)
    $piece.Height = $script:celebrationRandom.Next(14, 34)
    $piece.RadiusX = 2
    $piece.RadiusY = 2
    $piece.Fill = New-CelebrationBrush $palette[$script:celebrationRandom.Next(0, $palette.Count)]
    $piece.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
    $rotate = New-Object System.Windows.Media.RotateTransform
    $piece.RenderTransform = $rotate

    $startX = $script:celebrationRandom.Next(0, [Math]::Max(1, [int]$screenWidth))
    $startY = -1 * $script:celebrationRandom.Next(20, [Math]::Max(80, [int]($screenHeight * 0.35)))
    [void](Add-CelebrationChild -Canvas $fallLayer -Element $piece -X $startX -Y $startY)

    $begin = $script:celebrationRandom.Next(0, 360)
    $duration = $script:celebrationRandom.Next(1350, 2300)
    Move-CelebrationElement `
      -Element $piece `
      -FromX $startX -FromY $startY `
      -ToX ($startX + $script:celebrationRandom.Next(-260, 261)) `
      -ToY ($screenHeight + $script:celebrationRandom.Next(40, 260)) `
      -DurationMs $duration -BeginMs $begin `
      -EaseY (New-CelebrationEase -Kind "Sine" -Mode "In")
    $rotate.BeginAnimation(
      [System.Windows.Media.RotateTransform]::AngleProperty,
      (New-CelebrationAnim -From 0 -To $script:celebrationRandom.Next(-1440, 1441) -DurationMs $duration -BeginMs $begin)
    )
  }
  Set-CelebrationFade -Element $fallLayer -From 1 -To 0 -DurationMs 700 -BeginMs 1900

  for ($i = 0; $i -lt 45; $i += 1) {
    $piece = New-Object System.Windows.Shapes.Rectangle
    $piece.Width = $script:celebrationRandom.Next(9, 20)
    $piece.Height = $script:celebrationRandom.Next(12, 30)
    $piece.RadiusX = 2
    $piece.RadiusY = 2
    $piece.Fill = New-CelebrationBrush $palette[$script:celebrationRandom.Next(0, $palette.Count)]
    $piece.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
    $rotate = New-Object System.Windows.Media.RotateTransform
    $piece.RenderTransform = $rotate

    [void](Add-CelebrationChild -Canvas $burstLayer -Element $piece -X $Origin.X -Y $Origin.Y)

    $duration = $script:celebrationRandom.Next(900, 1550)
    $ease = New-CelebrationEase -Kind "Cubic" -Mode "Out"
    Move-CelebrationElement `
      -Element $piece `
      -FromX $Origin.X -FromY $Origin.Y `
      -ToX ($Origin.X + $script:celebrationRandom.Next(-420, 421)) `
      -ToY ($Origin.Y + $script:celebrationRandom.Next(-340, 380)) `
      -DurationMs $duration -EaseX $ease -EaseY $ease
    $rotate.BeginAnimation(
      [System.Windows.Media.RotateTransform]::AngleProperty,
      (New-CelebrationAnim -From 0 -To $script:celebrationRandom.Next(-1080, 1081) -DurationMs $duration)
    )
  }
  Set-CelebrationFade -Element $burstLayer -From 1 -To 0 -DurationMs 640 -BeginMs 900

  Close-CelebrationOverlay -Context $Context -AfterMs 2700
}

function Show-FireCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $screenWidth = $Context.Screen.Width
  $screenHeight = $Context.Screen.Height

  $flameLayer = New-Object System.Windows.Controls.Canvas
  [void]$canvas.Children.Add($flameLayer)
  $emberLayer = New-Object System.Windows.Controls.Canvas
  [void]$canvas.Children.Add($emberLayer)

  for ($i = 0; $i -lt 26; $i += 1) {
    $flame = New-FlameVisual
    $scale = $script:celebrationRandom.Next(70, 230) / 100
    $transform = $flame.RenderTransform
    $transform.Children[0].ScaleX = $scale
    $transform.Children[0].ScaleY = $scale

    $startX = $script:celebrationRandom.Next(0, [Math]::Max(1, [int]$screenWidth))
    $startY = $screenHeight + $script:celebrationRandom.Next(10, 220)
    [void](Add-CelebrationChild -Canvas $flameLayer -Element $flame -X $startX -Y $startY)

    $begin = $script:celebrationRandom.Next(0, 700)
    $duration = $script:celebrationRandom.Next(1500, 2500)
    Move-CelebrationElement `
      -Element $flame `
      -FromX $startX -FromY $startY `
      -ToX ($startX + $script:celebrationRandom.Next(-140, 141)) `
      -ToY ($script:celebrationRandom.Next(-120, [Math]::Max(1, [int]($screenHeight * 0.35)))) `
      -DurationMs $duration -BeginMs $begin `
      -EaseY (New-CelebrationEase -Kind "Sine" -Mode "Out")

    # One flicker clock per flame: the sway alone reads as fire.
    $transform.Children[1].BeginAnimation(
      [System.Windows.Media.RotateTransform]::AngleProperty,
      (New-CelebrationAnim -From -8 -To 8 -DurationMs $script:celebrationRandom.Next(320, 620) -AutoReverse -Forever)
    )
  }
  Set-CelebrationFade -Element $flameLayer -From 1 -To 0 -DurationMs 700 -BeginMs 2500

  # Embers off the button itself.
  for ($i = 0; $i -lt 22; $i += 1) {
    $ember = New-Object System.Windows.Shapes.Ellipse
    $size = $script:celebrationRandom.Next(4, 11)
    $ember.Width = $size
    $ember.Height = $size
    $ember.Fill = New-CelebrationBrush @("#FFD166", "#FF8C1A", "#FF4B1F")[$script:celebrationRandom.Next(0, 3)]
    [void](Add-CelebrationChild -Canvas $emberLayer -Element $ember -X $Origin.X -Y $Origin.Y)
    $duration = $script:celebrationRandom.Next(800, 1500)
    Move-CelebrationElement `
      -Element $ember `
      -FromX $Origin.X -FromY $Origin.Y `
      -ToX ($Origin.X + $script:celebrationRandom.Next(-260, 261)) `
      -ToY ($Origin.Y - $script:celebrationRandom.Next(120, 420)) `
      -DurationMs $duration -EaseY (New-CelebrationEase -Kind "Quad" -Mode "Out")
  }
  Set-CelebrationFade -Element $emberLayer -From 1 -To 0 -DurationMs 600 -BeginMs 1100

  [void](Add-CelebrationHeadline `
    -Context $Context -Text "ON FIRE" -FontSize 96 `
    -Color "#FFC93C" -Glow "#FF3B1F" -Family "Impact" `
    -CenterX ($screenWidth / 2) -Y ($screenHeight * 0.30) -BeginMs 260 -HoldMs 900)

  Close-CelebrationOverlay -Context $Context -AfterMs 3200
}

function Show-LetsGoCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $centerX = $Context.Screen.Width / 2
  $centerY = $Context.Screen.Height * 0.38
  $ballSize = [Math]::Min(300, [Math]::Max(170, $Context.Screen.Height * 0.26))

  # Impact lines radiating behind the ball.
  for ($i = 0; $i -lt 18; $i += 1) {
    $angle = ($i / 18) * 2 * [Math]::PI
    $ray = New-Object System.Windows.Shapes.Rectangle
    $ray.Width = $script:celebrationRandom.Next(40, 120)
    $ray.Height = $script:celebrationRandom.Next(6, 14)
    $ray.RadiusX = 4
    $ray.RadiusY = 4
    $ray.Fill = New-CelebrationBrush "#FFE066"
    $ray.Opacity = 0.85
    $ray.RenderTransformOrigin = New-Object System.Windows.Point(0.5, 0.5)
    $ray.RenderTransform = New-Object System.Windows.Media.RotateTransform(($angle * 180 / [Math]::PI))
    $innerRadius = $ballSize * 0.62
    $outerRadius = $ballSize * (0.95 + ($script:celebrationRandom.Next(0, 40) / 100))
    $fromX = $centerX + [Math]::Cos($angle) * $innerRadius
    $fromY = $centerY + [Math]::Sin($angle) * $innerRadius
    [void](Add-CelebrationChild -Canvas $canvas -Element $ray -X $fromX -Y $fromY)
    Move-CelebrationElement `
      -Element $ray `
      -FromX $fromX -FromY $fromY `
      -ToX ($centerX + [Math]::Cos($angle) * $outerRadius) `
      -ToY ($centerY + [Math]::Sin($angle) * $outerRadius) `
      -DurationMs 700 -EaseX (New-CelebrationEase -Kind "Quart" -Mode "Out") -EaseY (New-CelebrationEase -Kind "Quart" -Mode "Out")
    Set-CelebrationFade -Element $ray -From 0.85 -To 0 -DurationMs 620 -BeginMs 260
  }

  $ball = New-YellingBallVisual -Size $ballSize
  [void](Add-CelebrationChild -Canvas $canvas -Element $ball -X ($centerX - $ballSize / 2) -Y ($centerY - $ballSize / 2))
  $transform = $ball.RenderTransform
  $pop = New-CelebrationEase -Kind "Back" -Mode "Out" -Amplitude 1.1
  $transform.Children[0].BeginAnimation(
    [System.Windows.Media.ScaleTransform]::ScaleXProperty,
    (New-CelebrationAnim -From 0.1 -To 1 -DurationMs 460 -Ease $pop)
  )
  $transform.Children[0].BeginAnimation(
    [System.Windows.Media.ScaleTransform]::ScaleYProperty,
    (New-CelebrationAnim -From 0.1 -To 1 -DurationMs 460 -Ease $pop)
  )
  # Shake, because it is screaming.
  $transform.Children[1].BeginAnimation(
    [System.Windows.Media.RotateTransform]::AngleProperty,
    (New-CelebrationAnim -From -7 -To 7 -DurationMs 90 -BeginMs 460 -AutoReverse -Forever)
  )
  Set-CelebrationFade -Element $ball -From 1 -To 0 -DurationMs 400 -BeginMs 1900

  [void](Add-CelebrationHeadline `
    -Context $Context -Text "LET'S FUCKING GO" -FontSize 92 `
    -Color "#FFFFFF" -Glow "#111111" -Family "Impact" `
    -CenterX $centerX -Y ($centerY + $ballSize * 0.60) -BeginMs 380 -HoldMs 1000)

  Close-CelebrationOverlay -Context $Context -AfterMs 2600
}

function Show-BowlingCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $screenWidth = $Context.Screen.Width
  $screenHeight = $Context.Screen.Height
  $laneY = $screenHeight * 0.60
  $pinScale = 2.2
  $impactMs = 720

  # Standard 10-pin triangle, rows deepening away from the ball.
  $rows = @(1, 2, 3, 4)
  $pins = @()
  $rowIndex = 0
  foreach ($count in $rows) {
    $rowX = ($screenWidth * 0.50) + ($rowIndex * 46)
    for ($p = 0; $p -lt $count; $p += 1) {
      $pin = New-BowlingPinVisual
      $pin.RenderTransform.Children[0].ScaleX = $pinScale
      $pin.RenderTransform.Children[0].ScaleY = $pinScale
      $pinX = $rowX
      $pinY = $laneY - (($count - 1) * 26) + ($p * 52)
      [void](Add-CelebrationChild -Canvas $canvas -Element $pin -X $pinX -Y $pinY)
      $pins += [pscustomobject]@{ Element = $pin; X = $pinX; Y = $pinY }
    }
    $rowIndex += 1
  }

  $ballSize = 96
  $ball = New-BowlingBallVisual -Size $ballSize
  $ballY = $laneY + 12
  [void](Add-CelebrationChild -Canvas $canvas -Element $ball -X -160 -Y $ballY)
  # Rolls in, hits the pack, then crashes on through in one continuous path.
  $ball.BeginAnimation(
    [System.Windows.Controls.Canvas]::LeftProperty,
    (New-CelebrationKeyAnim -Frames @(
      @{ Value = ($screenWidth * 0.48); TimeMs = $impactMs; Ease = (New-CelebrationEase -Kind "Quad" -Mode "In") },
      @{ Value = ($screenWidth + 200); TimeMs = ($impactMs + 900); Ease = (New-CelebrationEase -Kind "Quad" -Mode "Out") }
    ))
  )
  $ball.BeginAnimation(
    [System.Windows.Controls.Canvas]::TopProperty,
    (New-CelebrationKeyAnim -Frames @(
      @{ Value = $ballY; TimeMs = $impactMs },
      @{ Value = ($ballY - 60); TimeMs = ($impactMs + 900) }
    ))
  )
  $ball.RenderTransform.Children[1].BeginAnimation(
    [System.Windows.Media.RotateTransform]::AngleProperty,
    (New-CelebrationAnim -From 0 -To 1500 -DurationMs ($impactMs + 900))
  )

  foreach ($entry in $pins) {
    $pin = $entry.Element
    $duration = $script:celebrationRandom.Next(700, 1200)
    $ease = New-CelebrationEase -Kind "Quart" -Mode "Out"
    Move-CelebrationElement `
      -Element $pin `
      -FromX $entry.X -FromY $entry.Y `
      -ToX ($entry.X + $script:celebrationRandom.Next(-120, 480)) `
      -ToY ($entry.Y + $script:celebrationRandom.Next(-360, 361)) `
      -DurationMs $duration -BeginMs $impactMs -EaseX $ease -EaseY $ease
    $pin.RenderTransform.Children[1].BeginAnimation(
      [System.Windows.Media.RotateTransform]::AngleProperty,
      (New-CelebrationAnim -From 0 -To $script:celebrationRandom.Next(-900, 901) -DurationMs $duration -BeginMs $impactMs)
    )
    Set-CelebrationFade -Element $pin -From 1 -To 0 -DurationMs 520 -BeginMs ($impactMs + $duration - 400)
  }

  [void](Add-CelebrationHeadline `
    -Context $Context -Text "STRIKE!" -FontSize 130 `
    -Color "#FFE066" -Glow "#7C3AED" -Family "Impact" `
    -CenterX ($screenWidth / 2) -Y ($screenHeight * 0.22) -BeginMs ($impactMs + 60) -HoldMs 900)

  Close-CelebrationOverlay -Context $Context -AfterMs 3200
}

function Show-FireworksCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $screenWidth = $Context.Screen.Width
  $screenHeight = $Context.Screen.Height
  $palettes = @(
    @("#FF5D8F", "#FF9EC4", "#FFFFFF"),
    @("#5CE1E6", "#8BF6FF", "#FFFFFF"),
    @("#FFD166", "#FFAD05", "#FFF6C8"),
    @("#B197FC", "#E0C3FC", "#FFFFFF"),
    @("#6EE7B7", "#A7F3D0", "#FFFFFF")
  )

  for ($burst = 0; $burst -lt 5; $burst += 1) {
    $palette = $palettes[$script:celebrationRandom.Next(0, $palettes.Count)]
    $burstX = $script:celebrationRandom.Next([int]($screenWidth * 0.12), [Math]::Max(2, [int]($screenWidth * 0.88)))
    $burstY = $script:celebrationRandom.Next([int]($screenHeight * 0.12), [Math]::Max(2, [int]($screenHeight * 0.55)))
    $launchMs = 420
    $burstBegin = ($burst * 260) + $launchMs

    $streak = New-Object System.Windows.Shapes.Rectangle
    $streak.Width = 5
    $streak.Height = 24
    $streak.RadiusX = 2
    $streak.RadiusY = 2
    $streak.Fill = New-CelebrationBrush $palette[0]
    [void](Add-CelebrationChild -Canvas $canvas -Element $streak -X $burstX -Y $screenHeight)
    Move-CelebrationElement `
      -Element $streak `
      -FromX $burstX -FromY $screenHeight `
      -ToX $burstX -ToY $burstY `
      -DurationMs $launchMs -BeginMs ($burst * 260) -EaseY (New-CelebrationEase -Kind "Quad" -Mode "Out")
    Set-CelebrationFade -Element $streak -From 1 -To 0 -DurationMs 120 -BeginMs ($burstBegin - 60)

    $sparkLayer = New-Object System.Windows.Controls.Canvas
    $sparkLayer.Opacity = 0
    [void]$canvas.Children.Add($sparkLayer)

    $count = 24
    for ($i = 0; $i -lt $count; $i += 1) {
      $angle = (($i / $count) * 2 * [Math]::PI) + ($script:celebrationRandom.Next(-12, 13) / 100)
      $radius = $script:celebrationRandom.Next(120, 290)
      # Radial-gradient dot rather than a blurred one: same soft glow, no filter.
      $spark = New-Object System.Windows.Shapes.Ellipse
      $size = $script:celebrationRandom.Next(10, 20)
      $spark.Width = $size
      $spark.Height = $size
      $sparkColor = $palette[$script:celebrationRandom.Next(0, $palette.Count)]
      $spark.Fill = New-CelebrationRadialBrush -Inner $sparkColor -Outer ("#00" + $sparkColor.Substring(1))
      [void](Add-CelebrationChild -Canvas $sparkLayer -Element $spark -X $burstX -Y $burstY)

      $duration = $script:celebrationRandom.Next(900, 1400)
      $ease = New-CelebrationEase -Kind "Quart" -Mode "Out"
      Move-CelebrationElement `
        -Element $spark `
        -FromX $burstX -FromY $burstY `
        -ToX ($burstX + [Math]::Cos($angle) * $radius) `
        -ToY ($burstY + [Math]::Sin($angle) * $radius + 90) `
        -DurationMs $duration -BeginMs $burstBegin -EaseX $ease -EaseY $ease
    }
    $sparkLayer.BeginAnimation(
      [System.Windows.UIElement]::OpacityProperty,
      (New-CelebrationKeyAnim -BeginMs $burstBegin -Frames @(
        @{ Value = 1; TimeMs = 60 },
        @{ Value = 1; TimeMs = 780 },
        @{ Value = 0; TimeMs = 1300 }
      ))
    )
  }

  Close-CelebrationOverlay -Context $Context -AfterMs 3400
}

function Show-CoinCelebration {
  param([object]$Context, [object]$Origin)
  $canvas = $Context.Canvas
  $screenHeight = $Context.Screen.Height

  for ($i = 0; $i -lt 60; $i += 1) {
    $size = $script:celebrationRandom.Next(22, 46)
    $coin = New-CoinVisual -Size $size
    $startX = $Origin.X + $script:celebrationRandom.Next(-40, 41)
    $startY = $Origin.Y
    [void](Add-CelebrationChild -Canvas $canvas -Element $coin -X $startX -Y $startY)

    $duration = $script:celebrationRandom.Next(1300, 2100)
    $coin.BeginAnimation(
      [System.Windows.Controls.Canvas]::LeftProperty,
      (New-CelebrationAnim -From $startX -To ($startX + $script:celebrationRandom.Next(-420, 421)) -DurationMs $duration)
    )
    $coin.BeginAnimation(
      [System.Windows.Controls.Canvas]::TopProperty,
      (New-CelebrationArcAnim `
        -Apex ($startY - $script:celebrationRandom.Next(220, 520)) `
        -To ($screenHeight + 120) `
        -DurationMs $duration)
    )
    # Squashing ScaleX reads as a spinning coin.
    $coin.RenderTransform.Children[0].BeginAnimation(
      [System.Windows.Media.ScaleTransform]::ScaleXProperty,
      (New-CelebrationAnim -From 1 -To -1 -DurationMs $script:celebrationRandom.Next(240, 460) -AutoReverse -Forever)
    )
    $coin.RenderTransform.Children[1].BeginAnimation(
      [System.Windows.Media.RotateTransform]::AngleProperty,
      (New-CelebrationAnim -From 0 -To $script:celebrationRandom.Next(-180, 181) -DurationMs $duration)
    )
  }

  Close-CelebrationOverlay -Context $Context -AfterMs 2600
}

# Read the enabled set fresh each time so Settings changes apply without a
# HUD restart. Anything missing from the file counts as enabled.
function Get-EnabledCelebrationKinds {
  $enabled = $script:celebrationKinds
  try {
    if (Test-Path -LiteralPath $appSettingsPath) {
      $settings = Get-Content -Raw -LiteralPath $appSettingsPath | ConvertFrom-Json
      if ($settings -and $settings.celebrations) {
        $enabled = @($script:celebrationKinds | Where-Object {
          $value = $settings.celebrations.$_
          $null -eq $value -or $value
        })
      }
    }
  } catch {
    $enabled = $script:celebrationKinds
  }
  return @($enabled)
}

function Start-Celebration {
  param([object]$SourceButton)
  try {
    $kinds = @(Get-EnabledCelebrationKinds)
    # Every animation turned off means no celebration at all, by choice.
    if ($kinds.Count -eq 0) { return }

    # Never repeat the previous one back-to-back; the variety is the point.
    $choices = @($kinds | Where-Object { $_ -ne $script:lastCelebration })
    if ($choices.Count -eq 0) { $choices = $kinds }
    $kind = $choices[$script:celebrationRandom.Next(0, $choices.Count)]
    $script:lastCelebration = $kind

    $context = New-CelebrationOverlay
    $origin = Get-CelebrationOrigin -SourceButton $SourceButton -Context $context

    switch ($kind) {
      "fire"        { Show-FireCelebration -Context $context -Origin $origin }
      "letsgo"      { Show-LetsGoCelebration -Context $context -Origin $origin }
      "bowling"     { Show-BowlingCelebration -Context $context -Origin $origin }
      "fireworks"   { Show-FireworksCelebration -Context $context -Origin $origin }
      "coins"       { Show-CoinCelebration -Context $context -Origin $origin }
      default       { Show-ConfettiCelebration -Context $context -Origin $origin }
    }
  } catch {
    # A failed celebration must never block task completion.
    try { if ($context) { $context.Overlay.Close() } } catch {}
  }
}

$savedSettings = Get-HudSettings

[xml]$xaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Event Horizon HUD"
  WindowStyle="None"
  AllowsTransparency="True"
  Background="Transparent"
  ResizeMode="CanResize"
  Topmost="True"
  ShowInTaskbar="False"
  Width="560"
  Height="54"
  MinWidth="180"
  MinHeight="32"
  SizeToContent="Manual"
  SnapsToDevicePixels="False"
  UseLayoutRounding="True">
  <Window.Resources>
    <Style x:Key="HudButton" TargetType="Button">
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Foreground" Value="#F7FFFB"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Focusable" Value="False"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border
              x:Name="ButtonChrome"
              Background="{TemplateBinding Background}"
              CornerRadius="9"
              SnapsToDevicePixels="False">
              <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="ButtonChrome" Property="Opacity" Value="0.88"/>
              </Trigger>
              <Trigger Property="IsPressed" Value="True">
                <Setter TargetName="ButtonChrome" Property="Opacity" Value="0.72"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>
  </Window.Resources>
  <Grid ClipToBounds="False">
    <Border x:Name="Shell"
            Margin="8"
            CornerRadius="22"
            Background="#141E1E"
            BorderBrush="#496A66"
            BorderThickness="1"
            SnapsToDevicePixels="False">
      <Border.Effect>
        <DropShadowEffect Color="#000000" BlurRadius="16" ShadowDepth="2" Opacity="0.25"/>
      </Border.Effect>
      <Grid Margin="10,6,10,6">
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="8"/>
          <ColumnDefinition Width="Auto"/>
          <ColumnDefinition Width="6"/>
          <ColumnDefinition Width="Auto"/>
          <ColumnDefinition Width="4"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>
        <StackPanel Grid.Column="0" VerticalAlignment="Center">
          <TextBlock x:Name="RuleLine"
                     FontFamily="Segoe UI"
                     FontWeight="SemiBold"
                     Foreground="#7FD6C4"
                     TextTrimming="CharacterEllipsis"
                     Margin="2,0,0,3"
                     Visibility="Collapsed"/>
          <StackPanel x:Name="TaskRows"/>
        </StackPanel>
        <StackPanel x:Name="RowCountPanel"
                    Grid.Column="2"
                    Orientation="Horizontal"
                    VerticalAlignment="Top"
                    Visibility="Collapsed"
                    ToolTip="How many Right Now tasks the HUD lists">
          <Button x:Name="RowCountLessButton"
                  Style="{StaticResource HudButton}"
                  Width="20"
                  Height="24"
                  Background="Transparent"
                  ToolTip="Show one fewer task">
            <Viewbox Width="9" Height="9">
              <Path Stroke="#A9B7B3"
                    StrokeThickness="1.8"
                    StrokeStartLineCap="Round"
                    StrokeEndLineCap="Round"
                    Data="M 2 5 L 8 5"/>
            </Viewbox>
          </Button>
          <TextBlock x:Name="RowCountLabel"
                     Text="5"
                     MinWidth="10"
                     Margin="1,0,1,0"
                     FontFamily="Segoe UI"
                     FontSize="11"
                     TextAlignment="Center"
                     VerticalAlignment="Center"
                     Foreground="#A9B7B3"/>
          <Button x:Name="RowCountMoreButton"
                  Style="{StaticResource HudButton}"
                  Width="20"
                  Height="24"
                  Background="Transparent"
                  ToolTip="Show one more task">
            <Viewbox Width="9" Height="9">
              <Path Stroke="#A9B7B3"
                    StrokeThickness="1.8"
                    StrokeStartLineCap="Round"
                    StrokeEndLineCap="Round"
                    Data="M 2 5 L 8 5 M 5 2 L 5 8"/>
            </Viewbox>
          </Button>
        </StackPanel>
        <Button x:Name="CloseButton"
                Grid.Column="4"
                Style="{StaticResource HudButton}"
                Width="24"
                Height="24"
                VerticalAlignment="Top"
                Background="Transparent"
                Visibility="Collapsed"
                Foreground="#A9B7B3"
                ToolTip="Close the HUD">
          <Viewbox Width="10" Height="10">
            <Path Stroke="#A9B7B3"
                  StrokeThickness="1.8"
                  StrokeStartLineCap="Round"
                  StrokeEndLineCap="Round"
                  Data="M 2 2 L 8 8 M 8 2 L 2 8"/>
          </Viewbox>
        </Button>
        <Button x:Name="MenuButton"
                Grid.Column="6"
                Style="{StaticResource HudButton}"
                Width="24"
                Height="24"
                VerticalAlignment="Top"
                Background="Transparent"
                Foreground="#A9B7B3"
                ToolTip="HUD options">
          <Viewbox Width="10" Height="10">
            <Path Fill="#A9B7B3"
                  Data="M 0.3,5 A 1.2,1.2 0 1 1 2.7,5 A 1.2,1.2 0 1 1 0.3,5 Z M 3.8,5 A 1.2,1.2 0 1 1 6.2,5 A 1.2,1.2 0 1 1 3.8,5 Z M 7.3,5 A 1.2,1.2 0 1 1 9.7,5 A 1.2,1.2 0 1 1 7.3,5 Z"/>
          </Viewbox>
        </Button>
        <ResizeGrip x:Name="ResizeGrip"
                    Grid.Column="6"
                    HorizontalAlignment="Right"
                    VerticalAlignment="Bottom"
                    Width="14"
                    Height="14"
                    Opacity="0.6"
                    Cursor="SizeNWSE"/>
      </Grid>
    </Border>
    <Canvas x:Name="ConfettiCanvas"
            IsHitTestVisible="False"
            ClipToBounds="False"/>
  </Grid>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)
$hudIcon = New-HudCheckIconSource
if ($hudIcon -ne $null) { $window.Icon = $hudIcon }

$window.Add_SourceInitialized({
  $window.Topmost = $true
  $window.ShowInTaskbar = $false
  Hide-WindowFromAltTab -TargetWindow $window -NoActivate $false
})

$window.Dispatcher.add_UnhandledException({
  param($sender, $event)
  $event.Handled = $true
  try {
    if ($confettiCanvas) { $confettiCanvas.Children.Clear() }
    $script:taskSignature = $null
    Refresh-Hud
  } catch {
    # Keep the HUD alive even if recovery text cannot be refreshed.
  }
})

$shell = $window.FindName("Shell")
$taskRows = $window.FindName("TaskRows")
$ruleLine = $window.FindName("RuleLine")
$menuButton = $window.FindName("MenuButton")
$closeButton = $window.FindName("CloseButton")
$rowCountPanel = $window.FindName("RowCountPanel")
$resizeGrip = $window.FindName("ResizeGrip")
$confettiCanvas = $window.FindName("ConfettiCanvas")
$rowCountLabel = $window.FindName("RowCountLabel")
$rowCountLessButton = $window.FindName("RowCountLessButton")
$rowCountMoreButton = $window.FindName("RowCountMoreButton")

if ($savedSettings.width) { $window.Width = [Math]::Max(180, [double]$savedSettings.width) }
if ($savedSettings.maxVisibleTasks) {
  $script:maxVisibleTasks = [int][Math]::Min($script:maxVisibleTasksLimit, [Math]::Max($script:minVisibleTasks, [double]$savedSettings.maxVisibleTasks))
}
if ($savedSettings.rowHeight) {
  $script:rowHeight = [Math]::Min(110, [Math]::Max(32, [double]$savedSettings.rowHeight))
} elseif ($savedSettings.height) {
  # Older settings stored the whole single-row window height; reuse it as the row height.
  $script:rowHeight = [Math]::Min(110, [Math]::Max(32, [double]$savedSettings.height))
}

$screen = [System.Windows.SystemParameters]::WorkArea
if ($savedSettings.left -ne $null -and $savedSettings.top -ne $null) {
  $window.Left = [Math]::Min([Math]::Max([double]$savedSettings.left, $screen.Left), $screen.Right - $window.Width)
  $window.Top = [Math]::Min([Math]::Max([double]$savedSettings.top, $screen.Top), $screen.Bottom - $window.Height)
} else {
  $window.Left = [Math]::Round(($screen.Width - $window.Width) / 2)
  $window.Top = 10
}

$rowCountLessButton.Add_Click({ Adjust-VisibleTaskCount -Delta -1 })
$rowCountMoreButton.Add_Click({ Adjust-VisibleTaskCount -Delta 1 })
$closeButton.Add_Click({ $window.Close() })
$menuButton.Add_Click({ Set-HudMenuOpen (-not $script:hudMenuOpen) })
$window.Add_MouseLeave({ if ($script:hudMenuOpen) { Set-HudMenuOpen $false } })
$resizeGrip.Add_PreviewMouseLeftButtonDown({
  param($sender, $event)
  $event.Handled = $true
  Start-ResizeBottomRight
})

$shell.Add_MouseLeftButtonDown({
  param($sender, $event)
  $source = $event.OriginalSource
  try {
    while ($null -ne $source -and $source -ne $shell) {
      if ($source -is [System.Windows.Controls.Primitives.ButtonBase] -or $source -eq $resizeGrip) { return }
      $source = [System.Windows.Media.VisualTreeHelper]::GetParent($source)
    }
  } catch {
    # Hit-test walk is best effort; fall through to drag.
  }
  try { $window.DragMove() } catch {}
})

$window.Add_KeyDown({
  param($sender, $event)
  if (($event.KeyboardDevice.Modifiers -band [System.Windows.Input.ModifierKeys]::Control) -and $event.Key -eq [System.Windows.Input.Key]::Z) {
    Undo-CompletedTask
    $event.Handled = $true
  }
})

$window.Add_SizeChanged({
  if ($null -ne $script:targetHeight -and [Math]::Abs($window.ActualHeight - $script:targetHeight) -gt 1.5) {
    # The user resized the window; translate the new height back into a per-row height.
    # The goal strip is chrome, not row space: leaving it in the divisor inflates every row
    # until the content outgrows the window and the rule line renders outside the shell.
    $counts = Get-HudRowCounts
    # Padding, font size and strip height all derive from the row height, so solving once
    # leaves a few pixels of drift; a couple of passes converges on the row height whose
    # content actually fills the window the user dragged out.
    for ($pass = 0; $pass -lt 4; $pass += 1) {
      $m = Get-HudMetrics
      $rowSpace = $window.ActualHeight - $m.ChromeHeight - $counts.MoreExtra - (Get-GoalStripHeight)
      $innerRowHeight = ($rowSpace / $counts.RowCount) - 4
      $script:rowHeight = [Math]::Min(110, [Math]::Max(32, $innerRowHeight + ($m.OuterPadding * 2) + 12))
    }
    $script:targetHeight = $window.ActualHeight
    Apply-HudScale
    # Clamping the row height (and rounding the padding) can still leave the window shorter
    # than the content needs, so grow it back. Never shrink here: that would fight the drag.
    $needed = Get-HudContentHeight
    if ($window.ActualHeight -lt $needed - 0.5) {
      $script:targetHeight = $needed
      $window.Height = $needed
    }
  }
  Schedule-HudSettingsSave
})
$window.Add_LocationChanged({ Schedule-HudSettingsSave })

$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromSeconds(2)
$timer.Add_Tick({ Refresh-Hud })

$window.Add_Loaded({
  $window.Topmost = $true
  $window.ShowInTaskbar = $false
  Hide-WindowFromAltTab -TargetWindow $window -NoActivate $false
  Update-RowCountLabel
  Apply-HudScale
  Refresh-Hud
  $timer.Start()
  $window.Activate()
  # Logged on Loaded, not at script start: the window being on screen is the thing
  # worth measuring, and the duplicate-launch guard above exits before this.
  $script:hudStartedAt = Get-Date
  Write-HudLog -Kind "start"
})

$window.Add_Closed({
  Save-HudSettings
  if ($script:hudStartedAt -ne $null) {
    Write-HudLog -Kind "end" -DurationSeconds ((Get-Date) - $script:hudStartedAt).TotalSeconds
  }
  if ($script:saveLayoutTimer -ne $null) {
    $script:saveLayoutTimer.Stop()
  }
  $timer.Stop()
  if ($script:trayIcon -ne $null) {
    $script:trayIcon.Visible = $false
    $script:trayIcon.Dispose()
    $script:trayIcon = $null
  }
})

[void]$window.ShowDialog()
