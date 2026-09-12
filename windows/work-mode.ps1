param(
  [int]$Minutes = 0,
  [int]$Port = 8787
)

# Work mode: a bright green band drawn around the edge of the screen for as long as
# you are meant to be working, plus an optional pomodoro readout.
#
# Deliberately separate from task-hud.ps1. The HUD is about what to do next;
# this is about being in the right mode at all, so it has to keep working when
# the HUD is closed and must never take focus or swallow a click. Every window
# it creates is topmost, tool-window, no-activate and click-through: the band
# is paint on the glass, and all control lives in the tray icon and Ctrl+Alt+F.
#
# The bands are plain opaque windows on purpose. A full-screen transparent
# overlay is a per-pixel-alpha layered window, which forces WPF into software
# rendering and recomposes the whole screen on the CPU every frame (see the
# celebration overlays in task-hud.ps1). Four thin solid rectangles cost
# essentially nothing and stay hardware-composited.
#
# Restarting: this script is read once at launch, so an edit does nothing until
# the process is killed and relaunched through launch-work-mode.vbs. The
# instance mutex is invisible from a sandboxed shell, so the reliable proof it
# is running is that Ctrl+Alt+F cannot be registered by anything else.

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies "System.Windows.Forms" -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class WorkModeNative {
  [DllImport("user32.dll", SetLastError=true)]
  private static extern int GetWindowLong(IntPtr hWnd, int nIndex);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")]
  private static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  private static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)]
  private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")]
  private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

  private const int GWL_EXSTYLE = -20;
  private const int WS_EX_TOOLWINDOW = 0x00000080;
  private const int WS_EX_APPWINDOW = 0x00040000;
  private const int WS_EX_NOACTIVATE = 0x08000000;
  private const int WS_EX_TRANSPARENT = 0x00000020;

  private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  private const uint SWP_NOSIZE = 0x0001;
  private const uint SWP_NOMOVE = 0x0002;
  private const uint SWP_NOACTIVATE = 0x0010;
  private const uint SWP_SHOWWINDOW = 0x0040;

  // WS_EX_LAYERED is deliberately never added here. A window that is not
  // already layered goes completely invisible the moment that bit is set
  // unless SetLayeredWindowAttributes follows; WS_EX_TRANSPARENT alone is what
  // actually makes the mouse pass through, and the pill window is already
  // layered because WPF's AllowsTransparency sets the bit itself.
  public static void MakeOverlay(IntPtr hWnd, bool clickThrough) {
    int style = GetWindowLong(hWnd, GWL_EXSTYLE);
    style = (style & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE;
    if (clickThrough) { style = style | WS_EX_TRANSPARENT; }
    SetWindowLong(hWnd, GWL_EXSTYLE, style);
  }

  // Placement goes through SetWindowPos in physical pixels rather than through
  // WPF's Left/Top/Width/Height, which are device-independent units. Screen
  // bounds arrive in the same physical space, so this sidesteps DPI scaling
  // entirely instead of trying to convert between the two.
  public static void PlaceAt(IntPtr hWnd, int x, int y, int w, int h) {
    SetWindowPos(hWnd, HWND_TOPMOST, x, y, w, h, SWP_NOACTIVATE | SWP_SHOWWINDOW);
  }

  public static void MoveTo(IntPtr hWnd, int x, int y) {
    SetWindowPos(hWnd, HWND_TOPMOST, x, y, 0, 0, SWP_NOSIZE | SWP_NOACTIVATE | SWP_SHOWWINDOW);
  }

  public static void ReassertTopmost(IntPtr hWnd) {
    SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE);
  }

  public static string GetForegroundTitle() {
    IntPtr h = GetForegroundWindow();
    if (h == IntPtr.Zero) { return ""; }
    int len = GetWindowTextLength(h);
    if (len <= 0) { return ""; }
    StringBuilder sb = new StringBuilder(len + 2);
    GetWindowText(h, sb, sb.Capacity);
    return sb.ToString();
  }

  public static int GetForegroundPid() {
    IntPtr h = GetForegroundWindow();
    if (h == IntPtr.Zero) { return 0; }
    uint pid;
    GetWindowThreadProcessId(h, out pid);
    return (int)pid;
  }
}

// Message-only window owning the Ctrl+Alt+F toggle. Same shape as the capture
// listeners: the hotkey must work whether or not any window is on screen.
public class WorkModeHotkeyListener : NativeWindow, IDisposable {
  [DllImport("user32.dll")]
  private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
  [DllImport("user32.dll")]
  private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

  private const int WM_HOTKEY = 0x0312;
  private int hotkeyId = 0;
  private bool registered = false;

  public event EventHandler HotKeyPressed;

  public WorkModeHotkeyListener() {
    CreateHandle(new CreateParams());
  }

  public bool Register(int id, uint modifiers, uint key) {
    hotkeyId = id;
    registered = RegisterHotKey(this.Handle, id, modifiers, key);
    return registered;
  }

  protected override void WndProc(ref Message m) {
    if (m.Msg == WM_HOTKEY && m.WParam.ToInt32() == hotkeyId && HotKeyPressed != null) {
      HotKeyPressed(this, EventArgs.Empty);
    }
    base.WndProc(ref m);
  }

  public void Dispose() {
    if (registered) {
      UnregisterHotKey(this.Handle, hotkeyId);
      registered = false;
    }
    DestroyHandle();
  }
}
"@

# One work mode per session. A second set of bands would double-draw every edge
# and fight the first over the hotkey.
$createdMutex = $false
$script:instanceMutex = New-Object System.Threading.Mutex($true, "Local\JournalWorkMode", [ref]$createdMutex)
if (-not $createdMutex) {
  exit
}

# This script lives in windows/; the data files it reads and writes are one
# level up, in the repo root.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
$settingsPath = Join-Path $root "work-mode-settings.json"
$eyeRestStatePath = Join-Path $root "eyerest-state.json"

# The one thing work mode sends anywhere. Everything else it does is local, and
# it still starts and runs with the server down - Invoke-CapturePost parks the
# session in outbox/ and server.cjs drains it on the next start, so a closed
# session is never lost to a node process the user is not supposed to think
# about. Same rule as the capture hotkeys; see capture-outbox.ps1.
. (Join-Path $scriptDir "capture-outbox.ps1")
$baseUrl = "http://127.0.0.1:$Port"

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

# Titles are matched case-insensitively against the foreground window only, and
# only when the foreground process is one of $distractionProcesses. Foreground
# rather than every window because a distracting page parked in a background
# tab is not what breaks a work session - the one you are looking at is - and
# because a minimised window would otherwise pin the band red all day.
#
# The cost of reading titles is that a site whose <title> never names itself
# cannot be caught. chess.com is the awkward one: its pages are titled things
# like "Play Chess Online - Free Games", so both spellings are listed. Add your
# own strings to work-mode-settings.json; nothing here is compiled in.
$script:defaults = @{
  bandThickness = 7
  allScreens = $false
  workModeOn = $true
  pomodoroEnabled = $true
  pomodoroMinutes = 30
  resetAfterEyeRest = $true
  chimeAtZero = $true
  pillPosition = "bottom"
  distractionWatchEnabled = $true
  distractionProcesses = @("chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc", "iexplore", "librewolf")
  distractionPatterns = @(
    "youtube", "facebook", "chess.com", "play chess online", "lichess",
    "reddit", "instagram", "twitch", "netflix", "tiktok", "9gag"
  )
}

$script:settings = @{}
foreach ($key in $script:defaults.Keys) { $script:settings[$key] = $script:defaults[$key] }

try {
  if (Test-Path -LiteralPath $settingsPath) {
    $saved = Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json
    foreach ($key in @($script:defaults.Keys)) {
      $value = $saved.$key
      if ($null -eq $value) { continue }
      if ($script:defaults[$key] -is [array]) {
        $script:settings[$key] = @($value)
      } else {
        $script:settings[$key] = $value
      }
    }
  }
} catch {
  # Corrupt or unreadable settings are not worth refusing to start over.
}

# Launching always shows the band, whatever the file says. workModeOn is saved
# because every tray change saves the whole settings object, but it describes a
# state during a session, not a preference for the next one: you start work mode
# because you want to work, and a launch that quietly comes up hidden is
# indistinguishable from a launch that failed.
$script:settings.workModeOn = $true

# Clamp anything a hand-edit could put out of range, so a typo in the JSON
# cannot produce a band that covers the screen or a timer that never ends.
$script:settings.bandThickness = [Math]::Min(40, [Math]::Max(2, [int]$script:settings.bandThickness))
$script:settings.pomodoroMinutes = [Math]::Min(240, [Math]::Max(1, [int]$script:settings.pomodoroMinutes))
if ($Minutes -gt 0) {
  $script:settings.pomodoroMinutes = [Math]::Min(240, [Math]::Max(1, $Minutes))
}

function Save-WorkModeSettings {
  try {
    $out = @{}
    foreach ($key in $script:settings.Keys) { $out[$key] = $script:settings[$key] }
    $out | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $settingsPath -Encoding UTF8
  } catch {
    # Best effort. A failed save only means the next launch uses the old values.
  }
}

# ---------------------------------------------------------------------------
# Palette
#
# #64FA87 electric green for the band, #00CD3C dark green for text. The band
# uses the electric green because it has to read at the very edge of
# peripheral vision; change both here if you want another colour.
# ---------------------------------------------------------------------------

function ConvertTo-MediaColor {
  param([string]$Hex)
  return [System.Windows.Media.Color][System.Windows.Media.ColorConverter]::ConvertFromString($Hex)
}

$script:colorWork = ConvertTo-MediaColor "#64FA87"
$script:colorRest = ConvertTo-MediaColor "#33453B"
$script:colorAlertA = ConvertTo-MediaColor "#FF3B30"
$script:colorAlertB = ConvertTo-MediaColor "#7A0F0A"
$script:colorOver = ConvertTo-MediaColor "#FFB020"
$script:colorMuted = ConvertTo-MediaColor "#8FA79A"

# Pill brushes are made once and frozen. The tick runs every second, so
# allocating three brushes per tick would be a steady drip of garbage for
# colours that only ever take three values.
function New-FrozenBrush {
  param([System.Windows.Media.Color]$Color)
  $brush = New-Object System.Windows.Media.SolidColorBrush($Color)
  $brush.Freeze()
  return $brush
}

$script:brushWork = New-FrozenBrush $script:colorWork
$script:brushOver = New-FrozenBrush $script:colorOver
$script:brushMuted = New-FrozenBrush $script:colorMuted

# One brush shared by every band window, so a colour change or a pulse is a
# single animation rather than one per edge per monitor.
$script:bandBrush = New-Object System.Windows.Media.SolidColorBrush($script:colorWork)

# ---------------------------------------------------------------------------
# Bands
# ---------------------------------------------------------------------------

$script:bands = @()
$script:screenSignature = ""

function Get-TargetScreens {
  if ($script:settings.allScreens) {
    return @([System.Windows.Forms.Screen]::AllScreens)
  }
  return @([System.Windows.Forms.Screen]::PrimaryScreen)
}

function Get-ScreenSignature {
  $parts = @()
  foreach ($screen in (Get-TargetScreens)) {
    $b = $screen.Bounds
    $parts += "$($b.X),$($b.Y),$($b.Width),$($b.Height)"
  }
  return ($parts -join "|")
}

function New-BandWindow {
  $window = New-Object System.Windows.Window
  $window.Title = "Journal Work Mode Band"
  $window.WindowStyle = [System.Windows.WindowStyle]::None
  $window.ResizeMode = [System.Windows.ResizeMode]::NoResize
  $window.AllowsTransparency = $false
  $window.ShowInTaskbar = $false
  $window.Topmost = $true
  $window.Background = $script:bandBrush
  $window.Focusable = $false
  # Parked off-screen at 1x1 until PlaceAt puts it where it belongs, so the
  # first frame is never a white rectangle in the middle of the display.
  $window.Left = -8000
  $window.Top = -8000
  $window.Width = 1
  $window.Height = 1
  $window.Show()
  $handle = (New-Object System.Windows.Interop.WindowInteropHelper($window)).Handle
  [WorkModeNative]::MakeOverlay($handle, $true)
  return [PSCustomObject]@{ Window = $window; Handle = $handle; Rect = $null }
}

# Placement is re-applied rather than assumed to have stuck. WPF keeps its own
# idea of Left/Top/Width/Height in device-independent units and re-imposes it on
# Show(), which would throw every band back to the 1x1 off-screen parking spot
# the moment work mode was toggled off and on again.
function Set-BandRect {
  param([object]$Band, [int[]]$Rect)
  $Band.Rect = $Rect
  [WorkModeNative]::PlaceAt($Band.Handle, $Rect[0], $Rect[1], $Rect[2], $Rect[3]) | Out-Null
}

function Remove-Bands {
  foreach ($band in $script:bands) {
    try { $band.Window.Close() } catch {}
  }
  $script:bands = @()
}

function Build-Bands {
  Remove-Bands
  $thickness = [int]$script:settings.bandThickness
  $created = @()
  foreach ($screen in (Get-TargetScreens)) {
    $b = $screen.Bounds
    # Top and bottom run the full width; the sides sit between them so the
    # corners are not painted twice (invisible with an opaque band, but it
    # would show the moment anyone gives these opacity).
    # A thickness wider than half the screen would give the side bands a
    # negative height, which SetWindowPos reads as an enormous one.
    $sideHeight = [Math]::Max(1, $b.Height - (2 * $thickness))
    $rects = @(
      @($b.X, $b.Y, $b.Width, $thickness),
      @($b.X, ($b.Y + $b.Height - $thickness), $b.Width, $thickness),
      @($b.X, ($b.Y + $thickness), $thickness, $sideHeight),
      @(($b.X + $b.Width - $thickness), ($b.Y + $thickness), $thickness, $sideHeight)
    )
    foreach ($rect in $rects) {
      $band = New-BandWindow
      Set-BandRect -Band $band -Rect $rect
      $created += $band
    }
  }
  $script:bands = $created
  $script:screenSignature = Get-ScreenSignature
  Update-BandVisibility
}

function Update-BandVisibility {
  $visible = [bool]$script:settings.workModeOn
  foreach ($band in $script:bands) {
    try {
      if ($visible) {
        if (-not $band.Window.IsVisible) {
          $band.Window.Show()
          if ($band.Rect) { Set-BandRect -Band $band -Rect $band.Rect }
        }
      } elseif ($band.Window.IsVisible) {
        $band.Window.Hide()
      }
    } catch {}
  }
}

# ---------------------------------------------------------------------------
# Band mood
#
# Three states, and they are kept separate on purpose so the band never has to
# say two things at once:
#   work       green, steady   - you are on the clock
#   rest       dim, steady     - an eye-rest break is running, the clock is not
#   distracted red, pulsing    - a distracting window is in front of you
# Running past the pomodoro is not a band state; it shows in the pill, because
# being over time and being distracted are different problems.
# ---------------------------------------------------------------------------

$script:bandMood = ""

function Set-BandMood {
  param([string]$Mood)
  if ($Mood -eq $script:bandMood) { return }
  $script:bandMood = $Mood

  # Clearing the animation before touching Color matters: an animated
  # DependencyProperty ignores direct assignment until the animation is removed.
  $script:bandBrush.BeginAnimation([System.Windows.Media.SolidColorBrush]::ColorProperty, $null)

  if ($Mood -eq "distracted") {
    $anim = New-Object System.Windows.Media.Animation.ColorAnimation
    $anim.From = $script:colorAlertA
    $anim.To = $script:colorAlertB
    $anim.Duration = New-Object System.Windows.Duration([TimeSpan]::FromMilliseconds(550))
    $anim.AutoReverse = $true
    $anim.RepeatBehavior = [System.Windows.Media.Animation.RepeatBehavior]::Forever
    $script:bandBrush.BeginAnimation([System.Windows.Media.SolidColorBrush]::ColorProperty, $anim)
    return
  }

  if ($Mood -eq "rest") {
    $script:bandBrush.Color = $script:colorRest
    return
  }

  $script:bandBrush.Color = $script:colorWork
}

# ---------------------------------------------------------------------------
# Pomodoro pill
# ---------------------------------------------------------------------------

[xml]$pillXaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Event Horizon Work Mode Timer"
  WindowStyle="None"
  AllowsTransparency="True"
  Background="Transparent"
  ResizeMode="NoResize"
  Topmost="True"
  ShowInTaskbar="False"
  SizeToContent="Manual"
  Width="150"
  Height="34"
  UseLayoutRounding="True">
  <Border x:Name="PillShell"
          CornerRadius="11"
          Background="#E60D1611"
          BorderBrush="#64FA87"
          BorderThickness="1.2">
    <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
      <TextBlock x:Name="PillLabel"
                 Text=""
                 Foreground="#8FA79A"
                 FontFamily="Roboto, Segoe UI"
                 FontSize="10"
                 FontWeight="SemiBold"
                 VerticalAlignment="Center"
                 Margin="0,1,7,0"/>
      <TextBlock x:Name="PillTime"
                 Text="30:00"
                 Foreground="#64FA87"
                 FontFamily="Roboto, Segoe UI"
                 FontSize="18"
                 FontWeight="SemiBold"
                 VerticalAlignment="Center"/>
    </StackPanel>
  </Border>
</Window>
"@

$pillReader = New-Object System.Xml.XmlNodeReader $pillXaml
$pillWindow = [Windows.Markup.XamlReader]::Load($pillReader)
$pillShell = $pillWindow.FindName("PillShell")
$pillLabel = $pillWindow.FindName("PillLabel")
$pillTime = $pillWindow.FindName("PillTime")

$pillWindow.Left = -8000
$pillWindow.Top = -8000
$pillWindow.Show()
$pillWindow.UpdateLayout()
$script:pillHandle = (New-Object System.Windows.Interop.WindowInteropHelper($pillWindow)).Handle
[WorkModeNative]::MakeOverlay($script:pillHandle, $true)

function Update-PillPlacement {
  try {
    $source = [System.Windows.PresentationSource]::FromVisual($pillWindow)
    $scaleX = 1.0
    $scaleY = 1.0
    if ($source -and $source.CompositionTarget) {
      $scaleX = $source.CompositionTarget.TransformToDevice.M11
      $scaleY = $source.CompositionTarget.TransformToDevice.M22
    }
    # ActualWidth is in device-independent units; the placement call wants
    # physical pixels, so the pill has to be measured through the DPI matrix
    # rather than assumed to be 150 pixels wide.
    $width = [int][Math]::Round($pillWindow.ActualWidth * $scaleX)
    $height = [int][Math]::Round($pillWindow.ActualHeight * $scaleY)
    # Anchored to the working area, not the full bounds: the band is topmost and
    # happily paints over the taskbar, but a readout parked on top of the pinned
    # icons is something you have to look past all day.
    $bounds = ([System.Windows.Forms.Screen]::PrimaryScreen).WorkingArea
    $gap = [int]$script:settings.bandThickness + 6

    $position = "" + $script:settings.pillPosition
    switch -Regex ($position) {
      'left$'  { $x = $bounds.X + $gap }
      'right$' { $x = $bounds.X + $bounds.Width - $width - $gap }
      default  { $x = $bounds.X + [int](($bounds.Width - $width) / 2) }
    }
    if ($position -like "top*") {
      $y = $bounds.Y + $gap
    } else {
      $y = $bounds.Y + $bounds.Height - $height - $gap
    }
    [WorkModeNative]::MoveTo($script:pillHandle, [int]$x, [int]$y) | Out-Null
  } catch {}
}

function Update-PillVisibility {
  $visible = ([bool]$script:settings.workModeOn) -and ([bool]$script:settings.pomodoroEnabled)
  try {
    if ($visible) {
      if (-not $pillWindow.IsVisible) { $pillWindow.Show() }
      Update-PillPlacement
    } elseif ($pillWindow.IsVisible) {
      $pillWindow.Hide()
    }
  } catch {}
}

# ---------------------------------------------------------------------------
# Pomodoro
#
# Held as an end timestamp rather than a decrementing counter, so a missed or
# late tick cannot make the clock drift and a machine that sleeps for an hour
# wakes up correctly deep in the negatives instead of where it left off.
# Remaining seconds go negative and keep going: overrunning is information, so
# the timer reports it rather than stopping at zero.
# ---------------------------------------------------------------------------

$script:pomoEndsAt = (Get-Date).AddMinutes($script:settings.pomodoroMinutes)
$script:pomoPaused = $false
$script:pomoPausedRemaining = 0
$script:pomoChimed = $false

function Get-PomodoroRemaining {
  if ($script:pomoPaused) { return [int]$script:pomoPausedRemaining }
  return [int][Math]::Floor(($script:pomoEndsAt - (Get-Date)).TotalSeconds)
}

function Reset-Pomodoro {
  $script:pomoEndsAt = (Get-Date).AddMinutes($script:settings.pomodoroMinutes)
  $script:pomoPaused = $false
  $script:pomoPausedRemaining = 0
  $script:pomoChimed = $false
}

function Suspend-Pomodoro {
  if ($script:pomoPaused) { return }
  $script:pomoPausedRemaining = Get-PomodoroRemaining
  $script:pomoPaused = $true
}

function Resume-Pomodoro {
  if (-not $script:pomoPaused) { return }
  $script:pomoEndsAt = (Get-Date).AddSeconds($script:pomoPausedRemaining)
  $script:pomoPaused = $false
}

function Format-PomodoroClock {
  param([int]$Seconds)
  $sign = ""
  if ($Seconds -lt 0) {
    $sign = "+"
    $Seconds = -$Seconds
  }
  $minutes = [Math]::Floor($Seconds / 60)
  $rest = $Seconds % 60
  return ("{0}{1:00}:{2:00}" -f $sign, $minutes, $rest)
}

# ---------------------------------------------------------------------------
# Eye-rest handshake
#
# eyerest-capture.ps1 writes eyerest-state.json on every stage change. A file
# rather than an API call because the whole point of the offline queue is that
# a capture never depends on the server being up, and work mode must not be the
# thing that reintroduces that dependency. It is also the only signal available:
# the eye-rest window can be hidden with Esc while the session keeps running, so
# "is the window on screen" says nothing about whether a break is in progress.
#
# The outcome field separates a logged break from a discarded one. Both resume
# the timer - leaving it paused forever because a break was discarded would be
# a trap - but only a logged break earns a fresh 30 minutes.
# ---------------------------------------------------------------------------

$script:eyeRestActive = $false
$script:eyeRestStamp = $null
$script:pauseReason = ""
$script:restStartedAt = $null
$script:restAccumulatedSeconds = 0

function Read-EyeRestState {
  $state = "idle"
  $outcome = ""
  try {
    if (-not (Test-Path -LiteralPath $eyeRestStatePath)) {
      $script:eyeRestStamp = $null
    } else {
      $info = Get-Item -LiteralPath $eyeRestStatePath
      if ($null -ne $script:eyeRestStamp -and $info.LastWriteTimeUtc -eq $script:eyeRestStamp) {
        return
      }
      $script:eyeRestStamp = $info.LastWriteTimeUtc
      $parsed = Get-Content -Raw -LiteralPath $eyeRestStatePath | ConvertFrom-Json
      $state = "" + $parsed.state
      $outcome = "" + $parsed.outcome
      # A listener killed mid-session leaves "running" on disk forever. Anything
      # older than three hours is treated as nobody being on a break, so a stale
      # file cannot hold the pomodoro paused indefinitely.
      if ($state -eq "running" -or $state -eq "review") {
        try {
          $changed = [DateTime]::Parse($parsed.changedAt, $null, [System.Globalization.DateTimeStyles]::RoundtripKind)
          if (((Get-Date).ToUniversalTime() - $changed.ToUniversalTime()).TotalHours -gt 3) { $state = "idle" }
        } catch {}
      }
    }
  } catch {
    return
  }

  $active = ($state -eq "running" -or $state -eq "review")
  if ($active -eq $script:eyeRestActive) { return }
  $script:eyeRestActive = $active

  if ($active) {
    Suspend-Pomodoro
    $script:pauseReason = "rest"
    if (-not $script:restStartedAt) { $script:restStartedAt = Get-Date }
    return
  }

  # Closed out here rather than inside the pauseReason branch below, so the
  # minutes are still subtracted from the session if anything else resumed the
  # timer in the meantime.
  if ($script:restStartedAt) {
    $script:restAccumulatedSeconds += ((Get-Date) - $script:restStartedAt).TotalSeconds
    $script:restStartedAt = $null
  }

  if ($script:pauseReason -eq "rest") {
    if ($outcome -eq "logged" -and $script:settings.resetAfterEyeRest) {
      Reset-Pomodoro
    } else {
      Resume-Pomodoro
    }
    $script:pauseReason = ""
  }
}

# ---------------------------------------------------------------------------
# Distraction watch
# ---------------------------------------------------------------------------

$script:distracted = $false
$script:distractionHits = 0
$script:processNameCache = @{}

function Get-ForegroundProcessName {
  param([int]$ProcessId)
  if ($ProcessId -le 0) { return "" }
  if ($script:processNameCache.ContainsKey($ProcessId)) { return $script:processNameCache[$ProcessId] }
  $name = ""
  try { $name = (Get-Process -Id $ProcessId -ErrorAction Stop).ProcessName } catch { $name = "" }
  $script:processNameCache[$ProcessId] = $name
  return $name
}

function Test-DistractingForeground {
  if (-not $script:settings.distractionWatchEnabled) { return $false }
  $title = ""
  try { $title = [WorkModeNative]::GetForegroundTitle() } catch { return $false }
  if (-not $title) { return $false }

  $processes = @($script:settings.distractionProcesses) | Where-Object { $_ }
  if ($processes.Count -gt 0) {
    $foregroundPid = 0
    try { $foregroundPid = [WorkModeNative]::GetForegroundPid() } catch {}
    $name = Get-ForegroundProcessName -ProcessId $foregroundPid
    if (-not $name) { return $false }
    $lowerName = $name.ToLowerInvariant()
    $matched = $false
    foreach ($candidate in $processes) {
      if ($lowerName -eq ([string]$candidate).ToLowerInvariant()) { $matched = $true; break }
    }
    if (-not $matched) { return $false }
  }

  $lowerTitle = $title.ToLowerInvariant()
  foreach ($pattern in @($script:settings.distractionPatterns)) {
    if (-not $pattern) { continue }
    if ($lowerTitle.Contains(([string]$pattern).ToLowerInvariant())) { return $true }
  }
  return $false
}

function Update-DistractionState {
  if (-not $script:settings.distractionWatchEnabled) {
    $script:distracted = $false
    $script:distractionHits = 0
    return
  }
  if (Test-DistractingForeground) {
    # Two consecutive hits before the band turns, so tabbing past YouTube on the
    # way somewhere else does not fire it. Clearing is immediate: the moment you
    # look away the band should go back to green without making you wait.
    $script:distractionHits += 1
    if ($script:distractionHits -ge 2) { $script:distracted = $true }
  } else {
    $script:distractionHits = 0
    $script:distracted = $false
  }
}

# ---------------------------------------------------------------------------
# Tick
# ---------------------------------------------------------------------------

$script:tickCount = 0

function Update-WorkMode {
  $script:tickCount += 1

  # Before anything else: a tick that arrives late says the machine was asleep,
  # and the open session has to be closed at the last tick rather than run on
  # through the gap. Read-EyeRestState comes after, so the rest it may open
  # belongs to the new sitting rather than the one just booked.
  Update-WorkSessionContinuity

  Read-EyeRestState

  # After the eye-rest read, so a break that has just opened is already counted
  # in the rest total the heartbeat writes down.
  Update-WorkSessionHeartbeat

  if ($script:tickCount % 2 -eq 0) { Update-DistractionState }

  # Pid reuse would otherwise let a closed browser's name stick to whatever
  # process inherits its id.
  if ($script:tickCount % 60 -eq 0) { $script:processNameCache = @{} }

  if ($script:tickCount % 10 -eq 0) {
    if ((Get-ScreenSignature) -ne $script:screenSignature) {
      Build-Bands
      Update-PillPlacement
    } elseif ($script:settings.workModeOn) {
      # Another topmost window can win the z-order race; re-asserting costs
      # nothing and keeps the band from quietly disappearing behind something.
      foreach ($band in $script:bands) {
        try { [WorkModeNative]::ReassertTopmost($band.Handle) | Out-Null } catch {}
      }
      if ($pillWindow.IsVisible) {
        try { [WorkModeNative]::ReassertTopmost($script:pillHandle) | Out-Null } catch {}
      }
    }
  }

  if ($script:eyeRestActive) {
    Set-BandMood "rest"
  } elseif ($script:distracted) {
    Set-BandMood "distracted"
  } else {
    Set-BandMood "work"
  }

  if (-not $script:settings.pomodoroEnabled) { return }

  $remaining = Get-PomodoroRemaining
  $pillTime.Text = Format-PomodoroClock $remaining

  if ($script:pomoPaused) {
    $pillLabel.Text = $(if ($script:pauseReason -eq "rest") { "REST" } else { "HOLD" })
    $pillTime.Foreground = $script:brushMuted
    $pillShell.BorderBrush = $script:brushMuted
    return
  }

  if ($remaining -lt 0) {
    if (-not $script:pomoChimed) {
      $script:pomoChimed = $true
      if ($script:settings.chimeAtZero) {
        try { [System.Media.SystemSounds]::Exclamation.Play() } catch {}
      }
    }
    $pillLabel.Text = "OVER"
    $pillTime.Foreground = $script:brushOver
    $pillShell.BorderBrush = $script:brushOver
    return
  }

  $pillLabel.Text = ""
  $pillTime.Foreground = $script:brushWork
  $pillShell.BorderBrush = $script:brushWork
}

# ---------------------------------------------------------------------------
# Work sessions
#
# Turning work mode off books the sitting on the calendar as a hot-pink
# "Work session" with no category. Uncategorised is not an oversight: app.js
# resolves an event's colour as categoryColor(category) || event.color, so any
# category would win and the pink would never show - and the pink is the point.
# It is a to-do, not a record. The block says "this happened, decide what it
# was", and it stays the one colour on the calendar that means "not filed yet"
# until you categorise it by hand.
#
# Durability. This used to hold the open session in memory alone, with a comment
# saying a session the process never got to close was "simply lost" because
# resurrecting it would book work that may have stopped hours earlier. That was
# right about the risk and wrong about the fix, and it cost nearly every
# session: work mode launches with the band already on, so the ordinary end of a
# sitting is a shutdown, a sleep or a logoff - and every one of those kills this
# process long before Stop-WorkSession runs. Two blocks reached the calendar in
# the first eight days.
#
# The open session now lives in work-session-state.json with a heartbeat
# rewritten every $sessionHeartbeatSeconds. A leftover file is booked on the
# next launch as startedAt -> heartbeatAt, so a recovered block ends where the
# band was last known to be up rather than whenever the machine came back. That
# is a measurement, not a guess, which is what the old comment was actually
# afraid of. It costs up to one heartbeat interval off the end.
#
# Sleep is handled separately, because a heartbeat cannot tell a sleeping
# machine from a dead one and both leave the same file behind. The tick runs
# once a second, so a gap longer than $sessionGapSeconds is the machine having
# been suspended or hung: the sitting is closed at the last tick and a new one
# opens on wake, instead of booking a night of sleep as ten hours of work.
#
# Every decision is appended to work-mode-log.json. A session dropped for being
# under the minimum used to look exactly like a hotkey that never fired; both
# are now readable after the fact.
# ---------------------------------------------------------------------------

$script:workStartedAt = $null
$script:workCaptureId = ""
$script:sessionStatePath = Join-Path $root "work-session-state.json"
$script:workLogPath = Join-Path $root "work-mode-log.json"
# Mirrors WORK_SESSION_MIN_SECONDS in server.cjs. Checked here so the usual case
# never posts at all; the server keeps its own copy for replayed payloads.
$script:workSessionMinSeconds = 5 * 60
$script:sessionHeartbeatSeconds = 10
$script:sessionGapSeconds = 90
$script:lastHeartbeatAt = $null
$script:lastTickAt = $null
# Trimmed rather than rotated. This is a diagnostic tail nothing reads back, and
# a file that grows forever in the app directory is its own small liability.
$script:workLogMaxRows = 500

function Write-WorkLog {
  # Not $Event: that is a PowerShell automatic variable, and shadowing it is a
  # trap for nothing.
  param([string]$EventName, [hashtable]$Data = @{})
  try {
    $rows = @()
    if (Test-Path -LiteralPath $script:workLogPath) {
      $parsed = Get-Content -Raw -LiteralPath $script:workLogPath | ConvertFrom-Json
      if ($parsed) { $rows = @($parsed) }
    }
    $row = [ordered]@{ at = (Get-Date).ToString("o"); event = $EventName }
    foreach ($key in $Data.Keys) { $row[$key] = $Data[$key] }
    $rows += (New-Object PSObject -Property $row)
    if ($rows.Count -gt $script:workLogMaxRows) {
      $rows = $rows[($rows.Count - $script:workLogMaxRows)..($rows.Count - 1)]
    }
    # Not Set-Content -Encoding UTF8: on Windows PowerShell 5.1 that writes a
    # BOM, and this file is meant to be readable by node alongside the rest.
    [System.IO.File]::WriteAllText(
      $script:workLogPath,
      (ConvertTo-Json -InputObject @($rows) -Depth 6),
      (New-Object System.Text.UTF8Encoding($false)))
  } catch {
    # Logging must never be the thing that costs a session.
  }
}

function Save-WorkSessionState {
  if (-not $script:workStartedAt) { return }
  try {
    # An eye rest that is still running counts towards the heartbeat rest total.
    # Leaving it out would book the minutes of a break the process died in the
    # middle of as work.
    $restSoFar = $script:restAccumulatedSeconds
    if ($script:restStartedAt) { $restSoFar += ((Get-Date) - $script:restStartedAt).TotalSeconds }
    $state = @{
      startedAt = $script:workStartedAt.ToUniversalTime().ToString("o")
      heartbeatAt = (Get-Date).ToUniversalTime().ToString("o")
      restSeconds = [int][Math]::Round($restSoFar)
      captureId = $script:workCaptureId
      ownerPid = $PID
    }
    $tempPath = $script:sessionStatePath + ".tmp"
    [System.IO.File]::WriteAllText($tempPath, ($state | ConvertTo-Json -Depth 4), (New-Object System.Text.UTF8Encoding($false)))
    Move-Item -LiteralPath $tempPath -Destination $script:sessionStatePath -Force
  } catch {
    # A heartbeat that cannot be written costs recovery, not the live session.
  }
}

function Clear-WorkSessionState {
  try {
    if (Test-Path -LiteralPath $script:sessionStatePath) {
      Remove-Item -LiteralPath $script:sessionStatePath -Force
    }
  } catch {}
}

function Update-WorkSessionHeartbeat {
  if (-not $script:workStartedAt) { return }
  $now = Get-Date
  if ($script:lastHeartbeatAt -and ($now - $script:lastHeartbeatAt).TotalSeconds -lt $script:sessionHeartbeatSeconds) { return }
  $script:lastHeartbeatAt = $now
  Save-WorkSessionState
}

# Called from the tick. The timer runs every second, so anything approaching two
# minutes of silence is the machine having been asleep rather than at work.
function Update-WorkSessionContinuity {
  $now = Get-Date
  $previous = $script:lastTickAt
  $script:lastTickAt = $now
  if (-not $previous) { return }
  $gap = ($now - $previous).TotalSeconds
  if ($gap -lt $script:sessionGapSeconds) { return }
  Write-WorkLog "session-split-on-gap" @{ gapSeconds = [int][Math]::Round($gap) }
  if (-not $script:workStartedAt) { return }
  # Closed at the last tick, not at now: the sitting ended when the lid did.
  Stop-WorkSession -EndedAt $previous
  if ($script:settings.workModeOn) { Start-WorkSession }
}

function Start-WorkSession {
  $script:workStartedAt = Get-Date
  $script:restAccumulatedSeconds = 0
  # Reopened rather than cleared when a break is already in progress, because
  # Read-EyeRestState only acts on a *change* of state. A session that starts
  # inside a running eye rest - the gap split after sleeping through one - would
  # otherwise never see it begin and would book the whole break as work.
  $script:restStartedAt = $(if ($script:eyeRestActive) { $script:workStartedAt } else { $null })
  # Pinned now rather than at post time, so the live post and a recovery of the
  # same session carry the same id and the server can tell they are one block.
  $script:workCaptureId = New-CaptureId
  $script:lastHeartbeatAt = $script:workStartedAt
  Save-WorkSessionState
  Write-WorkLog "session-start" @{ startedAt = $script:workStartedAt.ToString("o") }
}

# The single place a sitting becomes a calendar block. Takes plain values so the
# live switch-off and the recovery path cannot drift apart.
function Submit-WorkSession {
  param(
    [Parameter(Mandatory = $true)][datetime]$StartedAt,
    [Parameter(Mandatory = $true)][datetime]$EndedAt,
    [int]$RestSeconds = 0,
    [string]$CaptureId = "",
    [string]$Source = "toggle"
  )

  $elapsedSeconds = [int][Math]::Round(($EndedAt - $StartedAt).TotalSeconds)
  if ($elapsedSeconds -le 0) {
    Write-WorkLog "session-dropped" @{ source = $Source; reason = "end not after start"; elapsedSeconds = $elapsedSeconds }
    return
  }
  if ($RestSeconds -lt 0) { $RestSeconds = 0 }
  if ($RestSeconds -gt $elapsedSeconds) { $RestSeconds = $elapsedSeconds }
  $workedSeconds = $elapsedSeconds - $RestSeconds

  # "At least a 5 minute work period" is measured on working time, so turning
  # work mode on and immediately taking a long eye rest books nothing.
  if ($workedSeconds -lt $script:workSessionMinSeconds) {
    Write-WorkLog "session-skipped-short" @{
      source = $Source
      startedAt = $StartedAt.ToString("o")
      endedAt = $EndedAt.ToString("o")
      elapsedSeconds = $elapsedSeconds
      restSeconds = $RestSeconds
      workedSeconds = $workedSeconds
    }
    return
  }

  $payload = @{
    startedAt = $StartedAt.ToUniversalTime().ToString("o")
    endedAt = $EndedAt.ToUniversalTime().ToString("o")
    restSeconds = $RestSeconds
  }
  if ($CaptureId) { $payload.captureId = $CaptureId }

  $result = $null
  try {
    $result = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/work-session" -Payload $payload -TimeoutSec 3
  } catch {
    $result = @{ status = "failed" }
  }

  Write-WorkLog "session-posted" @{
    source = $Source
    status = "" + $result.status
    startedAt = $StartedAt.ToString("o")
    endedAt = $EndedAt.ToString("o")
    restSeconds = $RestSeconds
    workedSeconds = $workedSeconds
  }

  # "queued" is a success: the payload is a file in outbox/ and the server picks
  # it up on its next start. Only a rejection or an unwritable outbox actually
  # loses the session, and that is worth interrupting for - the whole reason the
  # block exists is that it will be forgotten otherwise.
  if ($result.status -eq "rejected" -or $result.status -eq "failed") {
    Show-WorkModeNotice -Title "Work session not logged" -Text (
      "A {0}-minute session could not be saved to the calendar. Add it by hand if it matters." -f
        [int][Math]::Round($workedSeconds / 60))
  }
}

function Stop-WorkSession {
  param([datetime]$EndedAt = (Get-Date))

  if (-not $script:workStartedAt) { return }
  $startedAt = $script:workStartedAt
  $captureId = $script:workCaptureId
  $script:workStartedAt = $null
  $script:workCaptureId = ""

  # Switching off in the middle of an eye rest still closes that break out, or
  # its minutes would count as work.
  if ($script:restStartedAt) {
    $script:restAccumulatedSeconds += ($EndedAt - $script:restStartedAt).TotalSeconds
    $script:restStartedAt = $null
  }
  $restSeconds = [int][Math]::Round($script:restAccumulatedSeconds)
  $script:restAccumulatedSeconds = 0

  # Cleared before the post, not after. A post that hangs and then has the
  # process killed under it would otherwise leave state that books the same
  # sitting again on the next launch; the pinned captureId keeps that harmless
  # at the server, but there is no reason to lean on it when the file is already
  # finished with.
  Clear-WorkSessionState

  Submit-WorkSession -StartedAt $startedAt -EndedAt $EndedAt -RestSeconds $restSeconds -CaptureId $captureId -Source "toggle"
}

# Runs once at launch, before the fresh session opens. This is what makes a
# shutdown, a sleep, a logoff or a killed process still reach the calendar.
function Restore-WorkSession {
  $state = $null
  try {
    if (-not (Test-Path -LiteralPath $script:sessionStatePath)) { return }
    $state = Get-Content -Raw -LiteralPath $script:sessionStatePath | ConvertFrom-Json
  } catch {
    Clear-WorkSessionState
    Write-WorkLog "session-recovery-unreadable" @{}
    return
  }
  # Removed up front, so a file that somehow cannot be booked is not retried on
  # every launch from here to eternity.
  Clear-WorkSessionState
  if (-not $state) { return }

  $startedAt = $null
  $endedAt = $null
  try {
    $startedAt = [DateTime]::Parse($state.startedAt, $null, [System.Globalization.DateTimeStyles]::RoundtripKind).ToLocalTime()
    $endedAt = [DateTime]::Parse($state.heartbeatAt, $null, [System.Globalization.DateTimeStyles]::RoundtripKind).ToLocalTime()
  } catch {
    Write-WorkLog "session-recovery-unreadable" @{}
    return
  }

  Write-WorkLog "session-recovered" @{
    startedAt = $startedAt.ToString("o")
    endedAt = $endedAt.ToString("o")
    ownerPid = "" + $state.ownerPid
  }
  Submit-WorkSession -StartedAt $startedAt -EndedAt $endedAt -RestSeconds ([int]$state.restSeconds) -CaptureId ("" + $state.captureId) -Source "recovered"
}

function Show-WorkModeNotice {
  param([string]$Title, [string]$Text)
  if (-not $script:trayIcon) { return }
  try {
    $script:trayIcon.ShowBalloonTip(8000, $Title, $Text, [System.Windows.Forms.ToolTipIcon]::Warning)
  } catch {}
}

# ---------------------------------------------------------------------------
# Controls
# ---------------------------------------------------------------------------

function Toggle-WorkMode {
  $turningOff = [bool]$script:settings.workModeOn
  # Stamped before anything else runs. The band coming down and the sitting
  # ending are the same instant, and none of the screen work below is allowed to
  # move that instant or - by throwing - to lose it.
  $endedAt = Get-Date
  $script:settings.workModeOn = -not $turningOff

  # Turning work mode on starts a clean pomodoro rather than resuming a stale
  # one: the interesting number is how long this sitting has run, not how long
  # ago some earlier one started.
  if (-not $turningOff) {
    Reset-Pomodoro
    $script:pauseReason = ""
    Start-WorkSession
  }

  try {
    Update-BandVisibility
    Update-PillVisibility
    Update-TrayIcon
    Save-WorkModeSettings
  } catch {
    # A session is worth more than a tidy band. Whatever went wrong on screen,
    # the switch-off below still has to book.
    Write-WorkLog "toggle-ui-error" @{ message = "" + $_.Exception.Message }
  }

  # Posted only after the band is down. An unreachable server costs this call up
  # to three seconds, and that wait belongs behind a screen that already looks
  # switched off rather than in front of one still showing the band.
  if ($turningOff) { Stop-WorkSession -EndedAt $endedAt }
}

function Toggle-Pomodoro {
  $script:settings.pomodoroEnabled = -not $script:settings.pomodoroEnabled
  if ($script:settings.pomodoroEnabled) {
    Reset-Pomodoro
    $script:pauseReason = ""
  }
  Update-PillVisibility
  Save-WorkModeSettings
}

function Toggle-PomodoroHold {
  if ($script:pomoPaused) {
    Resume-Pomodoro
    $script:pauseReason = ""
    return
  }
  Suspend-Pomodoro
  $script:pauseReason = "manual"
}

function Toggle-DistractionWatch {
  $script:settings.distractionWatchEnabled = -not $script:settings.distractionWatchEnabled
  Update-DistractionState
  Save-WorkModeSettings
}

function Toggle-AllScreens {
  $script:settings.allScreens = -not $script:settings.allScreens
  Build-Bands
  Update-PillPlacement
  Save-WorkModeSettings
}

function Set-PomodoroLength {
  param([int]$LengthMinutes)
  $script:settings.pomodoroMinutes = [Math]::Min(240, [Math]::Max(1, $LengthMinutes))
  Reset-Pomodoro
  $script:pauseReason = ""
  Save-WorkModeSettings
}

# ---------------------------------------------------------------------------
# Tray
# ---------------------------------------------------------------------------

$script:trayIcon = $null
$script:iconOn = $null
$script:iconOff = $null

function New-BandTrayIcon {
  param([System.Drawing.Color]$Color)
  try {
    $bitmap = New-Object System.Drawing.Bitmap(16, 16)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $pen = New-Object System.Drawing.Pen($Color, 3)
    $graphics.DrawRectangle($pen, 2, 2, 11, 11)
    $pen.Dispose()
    $graphics.Dispose()
    $handle = $bitmap.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($handle)
    $bitmap.Dispose()
    return $icon
  } catch {
    return [System.Drawing.SystemIcons]::Application
  }
}

function Update-TrayIcon {
  if (-not $script:trayIcon) { return }
  try {
    if ($script:settings.workModeOn) {
      $script:trayIcon.Icon = $script:iconOn
    } else {
      $script:trayIcon.Icon = $script:iconOff
    }
  } catch {}
}

function Initialize-WorkModeTray {
  try {
    $script:iconOn = New-BandTrayIcon ([System.Drawing.Color]::FromArgb(100, 250, 135))
    $script:iconOff = New-BandTrayIcon ([System.Drawing.Color]::FromArgb(94, 110, 100))

    $script:trayIcon = New-Object System.Windows.Forms.NotifyIcon
    $script:trayIcon.Icon = $script:iconOn
    $script:trayIcon.Text = "Work mode"
    $script:trayIcon.Visible = $true

    $menu = New-Object System.Windows.Forms.ContextMenuStrip

    $itemWork = New-Object System.Windows.Forms.ToolStripMenuItem("Work mode")
    $itemWork.Add_Click({ Toggle-WorkMode })
    $menu.Items.Add($itemWork) | Out-Null

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $itemPomodoro = New-Object System.Windows.Forms.ToolStripMenuItem("Pomodoro")
    $itemPomodoro.Add_Click({ Toggle-Pomodoro })
    $menu.Items.Add($itemPomodoro) | Out-Null

    $itemHold = New-Object System.Windows.Forms.ToolStripMenuItem("Pause timer")
    $itemHold.Add_Click({ Toggle-PomodoroHold })
    $menu.Items.Add($itemHold) | Out-Null

    $itemReset = New-Object System.Windows.Forms.ToolStripMenuItem("Reset timer")
    $itemReset.Add_Click({
      Reset-Pomodoro
      $script:pauseReason = ""
    })
    $menu.Items.Add($itemReset) | Out-Null

    $itemLength = New-Object System.Windows.Forms.ToolStripMenuItem("Length")
    foreach ($preset in @(15, 20, 25, 30, 45, 50, 60, 90)) {
      $entry = New-Object System.Windows.Forms.ToolStripMenuItem(("{0} min" -f $preset))
      $entry.Tag = $preset
      $entry.Add_Click({
        param($sender, $eventArgs)
        Set-PomodoroLength -LengthMinutes ([int]$sender.Tag)
      })
      $itemLength.DropDownItems.Add($entry) | Out-Null
    }
    $menu.Items.Add($itemLength) | Out-Null

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $itemWatch = New-Object System.Windows.Forms.ToolStripMenuItem("Flash red on distracting sites")
    $itemWatch.Add_Click({ Toggle-DistractionWatch })
    $menu.Items.Add($itemWatch) | Out-Null

    $itemScreens = New-Object System.Windows.Forms.ToolStripMenuItem("Band on all screens")
    $itemScreens.Add_Click({ Toggle-AllScreens })
    $menu.Items.Add($itemScreens) | Out-Null

    $menu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    $itemExit = New-Object System.Windows.Forms.ToolStripMenuItem("Exit work mode")
    $itemExit.Add_Click({
      if ($script:trayIcon) { $script:trayIcon.Visible = $false }
      [System.Windows.Threading.Dispatcher]::CurrentDispatcher.InvokeShutdown()
    })
    $menu.Items.Add($itemExit) | Out-Null

    # Ticks are written when the menu opens rather than kept in sync on every
    # change, so the hotkey and the menu can never disagree about the state.
    $menu.Add_Opening({
      $itemWork.Checked = [bool]$script:settings.workModeOn
      $itemWork.Text = "Work mode" + $script:hotkeyLabel
      $itemPomodoro.Checked = [bool]$script:settings.pomodoroEnabled
      $itemWatch.Checked = [bool]$script:settings.distractionWatchEnabled
      $itemScreens.Checked = [bool]$script:settings.allScreens
      if ($script:pomoPaused) {
        $itemHold.Text = "Resume timer"
      } else {
        $itemHold.Text = "Pause timer"
      }
      $itemHold.Enabled = [bool]$script:settings.pomodoroEnabled
      $itemReset.Enabled = [bool]$script:settings.pomodoroEnabled
      $itemLength.Text = "Length ({0} min)" -f $script:settings.pomodoroMinutes
      foreach ($entry in $itemLength.DropDownItems) {
        $entry.Checked = ([int]$entry.Tag -eq [int]$script:settings.pomodoroMinutes)
      }
    })

    $script:trayIcon.ContextMenuStrip = $menu
    $script:trayIcon.Add_MouseClick({
      param($sender, $mouseEvent)
      if ($mouseEvent.Button -eq [System.Windows.Forms.MouseButtons]::Left) { Toggle-WorkMode }
    })
    Update-TrayIcon
  } catch {
    # Without a tray icon the band still works and the hotkey still toggles it.
  }
}

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------

$script:hotkeyLabel = ""

Build-Bands
Update-PillVisibility
Initialize-WorkModeTray
Reset-Pomodoro
# Before the new session, not after: whatever the last run was killed in the
# middle of gets booked first, so the two cannot be confused for one sitting.
# After Initialize-WorkModeTray, because a failed post wants a balloon to land
# on. Costs up to three seconds at launch when the server is down.
Restore-WorkSession
# workModeOn is forced true above, so launching opens a session.
Start-WorkSession
Update-WorkMode

$tickTimer = New-Object System.Windows.Threading.DispatcherTimer
$tickTimer.Interval = [TimeSpan]::FromSeconds(1)
$tickTimer.Add_Tick({
  try {
    Update-WorkMode
  } catch {
    # One bad tick must not take the band down with it.
  }
})
$tickTimer.Start()

# MOD_ALT 0x1 | MOD_CONTROL 0x2 | MOD_SHIFT 0x4 | MOD_NOREPEAT 0x4000.
# F for focus, not W for work: Ctrl+Alt+W is already mistake-capture.ps1, and
# every other capture listener has a primary too (E eye rest, Q quick journal,
# L learn, C CBT), plus fallbacks that reach for R/Y/U/J/B/N/G/K. F and O are
# clear of all of them. Check mistake-capture.ps1 and the $attempts lists in the
# other listeners before changing these.
#
# Unlike the capture listeners, failing to get any hotkey is not fatal here: the
# tray icon is a complete substitute, so this stays silent rather than opening a
# message box over a machine that is only missing a convenience.
$listener = New-Object WorkModeHotkeyListener
$listener.add_HotKeyPressed({ Toggle-WorkMode })

$hotkeyAttempts = @(
  @{ Name = "Ctrl+Alt+F"; Modifiers = 0x4003; Key = 0x46 },
  @{ Name = "Ctrl+Shift+Alt+F"; Modifiers = 0x4007; Key = 0x46 },
  @{ Name = "Ctrl+Alt+O"; Modifiers = 0x4003; Key = 0x4F }
)

$registeredName = $null
foreach ($attempt in $hotkeyAttempts) {
  if ($listener.Register(1, [uint32]$attempt.Modifiers, [uint32]$attempt.Key)) {
    $registeredName = $attempt.Name
    break
  }
}

if ($registeredName) {
  $script:hotkeyLabel = " ({0})" -f $registeredName
}

if ($script:trayIcon) {
  if ($registeredName) {
    $script:trayIcon.Text = "Work mode - {0}" -f $registeredName
  } else {
    $script:trayIcon.Text = "Work mode - no hotkey free, use this icon"
  }
}

try {
  [System.Windows.Threading.Dispatcher]::Run()
} finally {
  $tickTimer.Stop()
  # Covers every clean shutdown, including the tray's Exit item: quitting work
  # mode is turning it off, and a session should not be lost for using the menu
  # instead of the hotkey. A second call is a no-op.
  if ($script:settings.workModeOn) { Stop-WorkSession }
  $listener.Dispose()
  if ($script:trayIcon) {
    $script:trayIcon.Visible = $false
    $script:trayIcon.Dispose()
  }
  Save-WorkModeSettings
  $script:instanceMutex.ReleaseMutex()
  $script:instanceMutex.Dispose()
}
