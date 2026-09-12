param(
  [int]$Port = 8787
)

# Background hotkey listener for eye-rest breaks. Runs with no visible window
# until Ctrl+Alt+E is pressed (or a fallback combo if that one is taken), then
# shows a small countdown window. Esc hides the window without losing the
# session - the countdown/stopwatch keep running invisibly in the background
# so the point of the break (not looking at the screen) is not undermined by
# having to keep a window open. Pressing the hotkey again brings the window
# back to whatever stage the session is at.
#
# Deliberately separate from task-hud.ps1 and mistake-capture.ps1: this must
# keep working whether or not those are open.

$ErrorActionPreference = "SilentlyContinue"

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies "System.Windows.Forms" -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

// Message-only window that owns the global hotkey. Keeping it separate from the
// WPF window means the WPF window never has to exist until the hotkey fires.
public class EyeRestHotkeyListener : NativeWindow, IDisposable {
  [DllImport("user32.dll")]
  private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
  [DllImport("user32.dll")]
  private static extern bool UnregisterHotKey(IntPtr hWnd, int id);
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern int GetWindowLong(IntPtr hWnd, int nIndex);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
  [DllImport("user32.dll")]
  private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
  [DllImport("kernel32.dll")]
  private static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")]
  private static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
  [DllImport("user32.dll")]
  private static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")]
  private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern IntPtr OpenInputDesktop(uint dwFlags, bool fInherit, uint dwDesiredAccess);
  [DllImport("user32.dll", SetLastError=true)]
  private static extern bool CloseDesktop(IntPtr hDesktop);
  [DllImport("kernel32.dll")]
  private static extern uint SetThreadExecutionState(uint esFlags);

  private const int WM_HOTKEY = 0x0312;
  private const int GWL_EXSTYLE = -20;
  private const int WS_EX_TOOLWINDOW = 0x00000080;
  private const int WS_EX_APPWINDOW = 0x00040000;
  private const uint DESKTOP_SWITCHDESKTOP = 0x0100;
  private const uint ES_CONTINUOUS = 0x80000000;
  private const uint ES_SYSTEM_REQUIRED = 0x00000001;
  private const uint ES_DISPLAY_REQUIRED = 0x00000002;

  private int hotkeyId = 0;
  private bool registered = false;

  public event EventHandler HotKeyPressed;

  public EyeRestHotkeyListener() {
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

  // Windows refuses SetForegroundWindow from a process that has not recently
  // received input, which is exactly what this listener is while the user types
  // with their eyes shut. Escalate through the two standard workarounds: attach
  // our input queue to the current foreground thread, then synthesize an ALT
  // tap (a real input event of our own) and try once more.
  public static bool ForceForeground(IntPtr hWnd) {
    if (GetForegroundWindow() == hWnd) return true;
    BringWindowToTop(hWnd);
    SetForegroundWindow(hWnd);
    if (GetForegroundWindow() == hWnd) return true;
    IntPtr fg = GetForegroundWindow();
    uint fgPid;
    uint fgThread = GetWindowThreadProcessId(fg, out fgPid);
    uint ourThread = GetCurrentThreadId();
    bool attached = false;
    if (fgThread != 0 && fgThread != ourThread) {
      attached = AttachThreadInput(ourThread, fgThread, true);
    }
    BringWindowToTop(hWnd);
    SetForegroundWindow(hWnd);
    if (attached) AttachThreadInput(ourThread, fgThread, false);
    if (GetForegroundWindow() == hWnd) return true;
    keybd_event(0xA4, 0, 0, UIntPtr.Zero);
    keybd_event(0xA4, 0, 0x0002, UIntPtr.Zero);
    SetForegroundWindow(hWnd);
    return GetForegroundWindow() == hWnd;
  }

  // The lock screen and the UAC prompt each run on their own desktop, and a
  // process sitting on the default desktop cannot open the input desktop while
  // one of those owns it. That failure is the cheapest reliable "the foreground
  // is not ours to take" signal, and it is what stops the focus watchdog from
  // fighting a fight it cannot win.
  public static bool IsInputDesktopUnreachable() {
    IntPtr desk = OpenInputDesktop(0, false, DESKTOP_SWITCHDESKTOP);
    if (desk == IntPtr.Zero) return true;
    CloseDesktop(desk);
    return false;
  }

  // Windows decides the chair is empty by counting input events, and a break is
  // defined by the absence of them, so a rest looks exactly like a walk-away:
  // display off, session locked, break over in every way but the countdown.
  // ES_CONTINUOUS holds the request until it is cleared rather than nudging the
  // idle timer once, and ES_DISPLAY_REQUIRED is the half that actually matters,
  // because the lock arrives by way of the display switching off. The state is
  // per-thread, so every call has to come from the dispatcher thread - and it
  // dies with the thread, so a crash here cannot strand the machine awake.
  public static bool KeepAwake(bool on) {
    uint flags = on
      ? (ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED)
      : ES_CONTINUOUS;
    return SetThreadExecutionState(flags) != 0;
  }

  public static void HideFromAltTab(IntPtr hWnd) {
    int style = GetWindowLong(hWnd, GWL_EXSTYLE);
    style = (style & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW;
    SetWindowLong(hWnd, GWL_EXSTYLE, style);
  }
}
"@

# One listener per session, or the second one silently fails to take the hotkey.
$createdMutex = $false
$script:instanceMutex = New-Object System.Threading.Mutex($true, "Local\JournalCaptureEyeRestHotkey", [ref]$createdMutex)
if (-not $createdMutex) {
  exit
}

# This script lives in windows/; the data files it reads and writes are one
# level up, in the repo root.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptDir
. (Join-Path $scriptDir "capture-outbox.ps1")
$baseUrl = "http://127.0.0.1:$Port"
$settingsPath = Join-Path $root "eyerest-settings.json"
$gongPath = Join-Path $root "assets\eyerest-gong.wav"

Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
$gongLogPath = Join-Path $root "eyerest-gong-log.txt"

# The gong is the only signal that the break is over and it has to reach shut
# eyes, so failures here are recorded rather than swallowed: a load error used
# to disappear into an empty catch and show up months later as "I didn't hear
# it today" with nothing to look at.
$script:gongPlayer = New-Object System.Media.SoundPlayer
$script:gongReady = $false
$script:gongLoadError = ""
if (Test-Path -LiteralPath $gongPath) {
  $script:gongPlayer.SoundLocation = $gongPath
  try {
    $script:gongPlayer.Load()
    $script:gongReady = $true
  } catch {
    $script:gongLoadError = $_.Exception.Message
  }
} else {
  $script:gongLoadError = "file missing: $gongPath"
}

# Windows gives a process one asynchronous PlaySound channel: whatever it plays
# next cancels whatever is still sounding. SoundPlayer (the gong) and
# SystemSounds (the focus watchdog's beep) both go through it, so a beep landing
# mid-gong cuts the gong off. This is how long the gong is left undisturbed -
# the shipped file is ~3.2s, and a generous default is harmless because the beep
# only competes during a focus theft.
$gongProtectSeconds = 4.0

$defaultDurationSeconds = 315
$script:sessionDurationSeconds = $defaultDurationSeconds
try {
  if (Test-Path -LiteralPath $settingsPath) {
    $saved = Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json
    if ($saved.durationSeconds -and $saved.durationSeconds -ge 15 -and $saved.durationSeconds -le 3600) {
      $script:sessionDurationSeconds = [int]$saved.durationSeconds
    }
  }
} catch {
  # Corrupt or missing settings file - keep the built-in default.
}

function Save-EyeRestSettings {
  try {
    @{ durationSeconds = $script:sessionDurationSeconds } | ConvertTo-Json | Set-Content -LiteralPath $settingsPath -Encoding UTF8
  } catch {
    # Best effort - a failed save just means the next session uses the old default.
  }
}

# idle | running | review
$script:sessionState = "idle"
# Mirrored to eyerest-state.json for anything outside this process that needs to
# know a break is on - work-mode.ps1 pauses its pomodoro on it. A file rather
# than an API call: the offline queue exists so a capture never depends on the
# server being up, and this must not reintroduce that dependency. It is also the
# only honest signal, because Esc hides the window while the session keeps
# running, so "is the window on screen" answers a different question.
# The outcome field is what lets a reader tell a logged break from a discarded
# one; it is set just before Reset-ToIdle and cleared by the next write.
$eyeRestStatePath = Join-Path $root "eyerest-state.json"
$script:sessionOutcome = ""

function Write-EyeRestState {
  param([string]$State)
  try {
    @{
      state = $State
      outcome = $script:sessionOutcome
      changedAt = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json | Set-Content -LiteralPath $eyeRestStatePath -Encoding UTF8
  } catch {
    # Best effort. A reader that misses a transition just keeps its old idea of
    # the state, which is never worse than the break not happening at all.
  }
}

# A listener killed mid-session leaves "running" on disk, so every launch
# starts by declaring the truth: nobody is on a break yet.
Write-EyeRestState "idle"
$script:sessionStart = $null
$script:sessionEnd = $null
$script:previousWindow = [IntPtr]::Zero
$script:gongPlayed = $false

# Blind journaling written during the break. The timestamps are the real
# writing window - first keystroke to last - not the break's start and end, so
# the block that lands in the day's document says when the words were actually
# written rather than when the eyes closed.
$script:writingStart = $null
$script:writingEnd = $null
# A submit does two POSTs. These remember which half already landed so a retry
# after a mid-sequence failure cannot double-log the rest event or append the
# journal block twice.
$script:journalExported = $false
$script:restLogged = $false

# Crash/misclick insurance for the blind journaling text. The box is written to
# eyerest-draft.txt a few seconds after every change and the file is only
# removed once a submit has actually landed; a Discard parks the text in
# eyerest-draft-discarded.txt instead of erasing it.
$draftPath = Join-Path $root "eyerest-draft.txt"
$discardedDraftPath = Join-Path $root "eyerest-draft-discarded.txt"
$script:draftDirty = $false

# Focus watchdog state. Keyboard input goes to the foreground window, so a
# notification or app stealing the foreground mid-break sends eyes-shut typing
# somewhere else without any visible sign. The watchdog notices, beeps (sound
# is the only channel that reaches shut eyes) and grabs the foreground back.
$script:windowHandle = [IntPtr]::Zero
$script:focusLossAnnounced = $false
$script:lastFocusBeep = [DateTime]::MinValue
$script:lastFocusGrab = [DateTime]::MinValue
$script:focusGrabFailures = 0
$script:screenLocked = $false
$script:gongUntil = [DateTime]::MinValue

# Append-only and plain text on purpose - nothing parses this, it exists so the
# next "I didn't hear the gong" has evidence behind it instead of guesswork.
function Write-GongLog([string]$message) {
  try {
    Add-Content -LiteralPath $gongLogPath -Encoding UTF8 `
      -Value ((Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + "  " + $message)
    $lines = @(Get-Content -LiteralPath $gongLogPath -ErrorAction Stop)
    if ($lines.Count -gt 200) {
      Set-Content -LiteralPath $gongLogPath -Value $lines[-200..-1] -Encoding UTF8
    }
  } catch {}
}

# Keep-awake. While a session is open this process tells Windows the machine is
# in use, so sitting perfectly still for a break no longer reads as inactivity
# and the display neither sleeps nor takes the session down to the lock screen.
# It is held for the whole session - not just while the window is on screen -
# because Esc hides the window and the break carries on behind it, which is the
# case where the lock used to arrive.
#
# The expiry is the point of the design, not a safeguard bolted onto it. A
# request nothing ever releases turns "started a break and then genuinely walked
# away" into a machine held awake all afternoon, so it is dropped after
# $keepAwakeMaxSeconds whether or not the session is still open; past that the
# computer sleeps on its own schedule exactly as if this script were not here.
#
# The floor exists because a deliberately long break is itself a statement of
# presence - setting a 20-minute rest and being put to sleep at 15 would be the
# bug this feature is meant to fix - and the grace covers the review panel that
# follows the countdown.
$keepAwakeMaxSeconds = 900
$keepAwakeGraceSeconds = 60
$script:keepAwakeOn = $false
$script:keepAwakeUntil = $null
$script:keepAwakeExpiryLogged = $false

function Set-KeepAwake([bool]$On) {
  if ($On -eq $script:keepAwakeOn) { return }
  $ok = $false
  try { $ok = [EyeRestHotkeyListener]::KeepAwake($On) } catch {}
  $script:keepAwakeOn = $On
  if (-not $ok) {
    $what = if ($On) { "request" } else { "release" }
    Write-GongLog ("keep-awake " + $what + " refused by Windows - the usual sleep and lock timers apply")
  }
}

# Dated from the session start rather than from now, so re-arming after a
# mid-session length change moves the deadline to where it always should have
# been instead of buying another full window.
function Start-KeepAwake {
  $base = if ($script:sessionStart) { $script:sessionStart } else { Get-Date }
  $limit = [Math]::Max($keepAwakeMaxSeconds, $script:sessionDurationSeconds + $keepAwakeGraceSeconds)
  $script:keepAwakeUntil = $base.AddSeconds($limit)
  $script:keepAwakeExpiryLogged = $false
  Set-KeepAwake $true
}

function Stop-KeepAwake {
  $script:keepAwakeUntil = $null
  Set-KeepAwake $false
}

# Its own timer rather than a line inside the countdown or the focus watchdog:
# both of those return early in states this still has to expire in, and a
# request left held by an early return is the one failure mode whose cost is
# measured in hours of battery.
$keepAwakeTimer = New-Object System.Windows.Threading.DispatcherTimer
$keepAwakeTimer.Interval = [TimeSpan]::FromSeconds(5)
$keepAwakeTimer.Add_Tick({
  if (-not $script:keepAwakeOn) { return }
  if ($script:keepAwakeUntil -and (Get-Date) -lt $script:keepAwakeUntil) { return }
  Set-KeepAwake $false
  if (-not $script:keepAwakeExpiryLogged) {
    $script:keepAwakeExpiryLogged = $true
    Write-GongLog "keep-awake expired with the session still open - normal sleep and lock timers are back"
    # Say so where it gets read when the eyes open again, but never over a focus
    # theft notice: that one is about keystrokes that went somewhere else.
    if ($script:sessionState -eq "running" -and $runningStatusText.Text -eq $runningDefaultStatus) {
      $minutes = [int][Math]::Round($keepAwakeMaxSeconds / 60)
      $runningStatusText.Text = "Open $minutes+ minutes, so the screen can sleep and lock again from here - the countdown keeps running."
    }
  }
})
$keepAwakeTimer.Start()

# Play() returning cleanly only means Windows accepted the sound - it cannot
# prove the default output device is the one in the user's ears, so the log says
# what was attempted, not that it was heard. Whether the watchdog was mid focus
# theft is recorded too, since its beep is the one thing in this process that
# can cut the gong short.
function Play-EyeRestGong {
  $script:gongUntil = (Get-Date).AddSeconds($gongProtectSeconds)
  $context = if ($script:focusLossAnnounced) { " (during a focus theft)" } else { "" }
  if (-not $script:gongReady) {
    Write-GongLog ("gong unavailable, beeped instead - " + $script:gongLoadError + $context)
    try { [System.Media.SystemSounds]::Exclamation.Play() } catch {}
    return
  }
  try {
    $script:gongPlayer.Play()
    Write-GongLog ("gong sent to the default output device" + $context)
  } catch {
    Write-GongLog ("gong failed, beeped instead - " + $_.Exception.Message + $context)
    try { [System.Media.SystemSounds]::Exclamation.Play() } catch {}
  }
}

[xml]$xaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Eye rest"
  WindowStyle="None"
  AllowsTransparency="True"
  Background="Transparent"
  ResizeMode="NoResize"
  Topmost="True"
  ShowInTaskbar="False"
  ShowActivated="True"
  SizeToContent="Height"
  Width="460"
  UseLayoutRounding="True">
  <Window.Resources>
    <Style x:Key="FieldLabel" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#8FB3AE"/>
      <Setter Property="FontSize" Value="11"/>
      <Setter Property="FontWeight" Value="SemiBold"/>
      <Setter Property="Margin" Value="0,0,0,3"/>
    </Style>
    <Style x:Key="FieldBox" TargetType="TextBox">
      <Setter Property="Background" Value="#1B2828"/>
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="BorderBrush" Value="#39534F"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="7,5,7,5"/>
      <Setter Property="FontSize" Value="13"/>
      <Setter Property="CaretBrush" Value="#7FE3D2"/>
    </Style>
    <Style x:Key="ChoiceCheck" TargetType="CheckBox">
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="FontSize" Value="13"/>
      <Setter Property="Margin" Value="0,0,0,7"/>
    </Style>
    <Style x:Key="ActionButton" TargetType="Button">
      <Setter Property="Padding" Value="14,5,14,5"/>
      <Setter Property="Background" Value="#1F8C7C"/>
      <Setter Property="Foreground" Value="#F7FFFB"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Cursor" Value="Hand"/>
    </Style>
    <Style x:Key="QuietButton" TargetType="Button">
      <Setter Property="Padding" Value="8,4,8,4"/>
      <Setter Property="Background" Value="Transparent"/>
      <Setter Property="Foreground" Value="#7C9B97"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Cursor" Value="Hand"/>
    </Style>
  </Window.Resources>
  <Border Margin="10"
          CornerRadius="14"
          Background="#111B1B"
          BorderBrush="#496A66"
          BorderThickness="1">
    <Border.Effect>
      <DropShadowEffect Color="#000000" BlurRadius="18" ShadowDepth="3" Opacity="0.35"/>
    </Border.Effect>
    <StackPanel Margin="16,14,16,12">
      <TextBlock Text="Eye rest"
                 Foreground="#F1FAF7"
                 FontSize="14"
                 FontWeight="Bold"
                 Margin="0,0,0,10"/>

      <StackPanel x:Name="RunningPanel">
        <TextBlock x:Name="CountdownText"
                   Text="5:15"
                   Foreground="#7FE3D2"
                   FontSize="40"
                   FontWeight="Bold"
                   HorizontalAlignment="Center"
                   Margin="0,4,0,14"/>

        <TextBlock Text="Blind journaling - goes into today's document"
                   Style="{StaticResource FieldLabel}"/>
        <TextBox x:Name="JournalBox"
                 Style="{StaticResource FieldBox}"
                 AcceptsReturn="True"
                 AcceptsTab="True"
                 TextWrapping="Wrap"
                 MinHeight="130"
                 MaxHeight="300"
                 VerticalScrollBarVisibility="Auto"
                 Margin="0,0,0,12"/>

        <Grid Margin="0,0,0,12">
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="*"/>
          </Grid.ColumnDefinitions>
          <TextBlock Grid.Column="0"
                     Text="Length (m:ss)"
                     Style="{StaticResource FieldLabel}"
                     VerticalAlignment="Center"
                     Margin="0,0,8,0"/>
          <TextBox x:Name="DurationBox"
                   Grid.Column="1"
                   Style="{StaticResource FieldBox}"
                   Text="5:15"/>
        </Grid>

        <Grid>
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="Auto"/>
          </Grid.ColumnDefinitions>
          <TextBlock x:Name="RunningStatusText"
                     Grid.Column="0"
                     Text="Esc hides (the timer keeps going) - Ctrl+Enter when done"
                     Foreground="#7C9B97"
                     FontSize="11"
                     TextWrapping="Wrap"
                     VerticalAlignment="Center"/>
          <Button x:Name="DiscardRunningButton"
                  Grid.Column="1"
                  Content="Discard"
                  Style="{StaticResource QuietButton}"
                  Margin="0,0,6,0"/>
          <Button x:Name="DoneButton"
                  Grid.Column="2"
                  Content="Done"
                  Style="{StaticResource ActionButton}"/>
        </Grid>
      </StackPanel>

      <StackPanel x:Name="ReviewPanel" Visibility="Collapsed">
        <TextBlock x:Name="ElapsedText"
                   Text="You rested for 0:00."
                   Foreground="#7FE3D2"
                   FontSize="15"
                   FontWeight="Bold"
                   Margin="0,0,0,10"/>

        <TextBlock x:Name="JournalSummaryText"
                   Visibility="Collapsed"
                   Foreground="#7C9B97"
                   FontSize="11"
                   TextWrapping="Wrap"
                   Margin="0,0,0,10"/>

        <TextBlock Text="How did you rest your eyes?" Style="{StaticResource FieldLabel}"/>
        <CheckBox x:Name="ChoiceMeditated" Content="Closed eyes and meditated" Style="{StaticResource ChoiceCheck}"/>
        <CheckBox x:Name="ChoiceBlindJournal" Content="Blind journaling" Style="{StaticResource ChoiceCheck}"/>
        <CheckBox x:Name="ChoiceSatLooked" Content="Sat and looked around" Style="{StaticResource ChoiceCheck}"/>
        <CheckBox x:Name="ChoiceWalked" Content="Walked and looked around" Style="{StaticResource ChoiceCheck}"/>

        <TextBlock Text="Or write your own" Style="{StaticResource FieldLabel}" Margin="0,4,0,3"/>
        <TextBox x:Name="CustomBox"
                 Style="{StaticResource FieldBox}"
                 AcceptsReturn="True"
                 TextWrapping="Wrap"
                 MinHeight="34"
                 MaxHeight="80"
                 VerticalScrollBarVisibility="Auto"
                 Margin="0,0,0,10"/>

        <Grid>
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="Auto"/>
          </Grid.ColumnDefinitions>
          <TextBlock x:Name="ReviewStatusText"
                     Grid.Column="0"
                     Text="Ctrl+Enter to log - Esc to hide"
                     Foreground="#7C9B97"
                     FontSize="11"
                     TextWrapping="Wrap"
                     VerticalAlignment="Center"/>
          <Button x:Name="DiscardReviewButton"
                  Grid.Column="1"
                  Content="Discard"
                  Style="{StaticResource QuietButton}"
                  Margin="0,0,6,0"/>
          <Button x:Name="LogButton"
                  Grid.Column="2"
                  Content="Log it"
                  Style="{StaticResource ActionButton}"/>
        </Grid>
      </StackPanel>
    </StackPanel>
  </Border>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

$runningPanel = $window.FindName("RunningPanel")
$reviewPanel = $window.FindName("ReviewPanel")
$countdownText = $window.FindName("CountdownText")
$durationBox = $window.FindName("DurationBox")
$journalBox = $window.FindName("JournalBox")
$runningStatusText = $window.FindName("RunningStatusText")
$doneButton = $window.FindName("DoneButton")
$discardRunningButton = $window.FindName("DiscardRunningButton")
$elapsedText = $window.FindName("ElapsedText")
$journalSummaryText = $window.FindName("JournalSummaryText")
$choiceMeditated = $window.FindName("ChoiceMeditated")
$choiceBlindJournal = $window.FindName("ChoiceBlindJournal")
$choiceSatLooked = $window.FindName("ChoiceSatLooked")
$choiceWalked = $window.FindName("ChoiceWalked")
$customBox = $window.FindName("CustomBox")
$reviewStatusText = $window.FindName("ReviewStatusText")
$discardReviewButton = $window.FindName("DiscardReviewButton")
$logButton = $window.FindName("LogButton")

$runningDefaultStatus = "Esc hides (the timer keeps going) - Ctrl+Enter when done"
$reviewDefaultStatus = "Ctrl+Enter to log - Esc to hide"

function Format-Duration([int]$totalSeconds) {
  if ($totalSeconds -lt 0) { $totalSeconds = 0 }
  $minutes = [Math]::Floor($totalSeconds / 60)
  $seconds = $totalSeconds % 60
  return "{0}:{1:D2}" -f $minutes, $seconds
}

function Parse-DurationText([string]$text) {
  $text = $text.Trim()
  if ($text -match "^(\d+):([0-5]?\d)$") {
    return ([int]$Matches[1] * 60) + [int]$Matches[2]
  }
  if ($text -match "^\d+$") {
    return [int]$text
  }
  return $null
}

# Converts System.Windows.Forms pixel coordinates into the WPF device-independent
# units used by Window.Left/Top. See mistake-capture.ps1 for why Graphics.DpiX
# is wrong here.
function Get-DeviceToDipScale {
  try {
    $physical = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
    $logical = [System.Windows.SystemParameters]::PrimaryScreenWidth
    if ($logical -gt 0 -and $physical -gt 0) {
      return $physical / $logical
    }
  } catch {
    # Fall through to the unscaled default.
  }
  return 1.0
}

function Set-CaptureWindowPosition {
  $scale = Get-DeviceToDipScale
  try {
    $cursor = [System.Windows.Forms.Cursor]::Position
    $screen = [System.Windows.Forms.Screen]::FromPoint($cursor)
  } catch {
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen
  }
  $area = $screen.WorkingArea
  $left = ($area.Left / $scale) + ((($area.Width / $scale) - $window.Width) / 2)
  $height = $window.ActualHeight
  if ($height -le 0) { $height = 300 }
  $top = ($area.Top / $scale) + ((($area.Height / $scale) - $height) / 3)
  $window.Left = [Math]::Round($left)
  $window.Top = [Math]::Round([Math]::Max($top, ($area.Top / $scale) + 20))
}

function Show-EyeRestWindow {
  $script:previousWindow = [EyeRestHotkeyListener]::GetForegroundWindow()
  Set-CaptureWindowPosition
  $window.Show()
  Set-CaptureWindowPosition
  $window.Activate()
  try {
    $handle = (New-Object System.Windows.Interop.WindowInteropHelper($window)).Handle
    $script:windowHandle = $handle
    [EyeRestHotkeyListener]::HideFromAltTab($handle)
    [void][EyeRestHotkeyListener]::ForceForeground($handle)
  } catch {
    # Activation is best effort here; the focus watchdog retries within 300ms
    # and beeps if the grab keeps failing, so a lost race is heard, not silent.
  }
}

# Hiding never discards the session - Esc must not be able to lose a break that
# is already in progress or already finished and waiting to be logged.
function Hide-EyeRestWindow {
  $window.Hide()
  if ($script:previousWindow -ne [IntPtr]::Zero) {
    [void][EyeRestHotkeyListener]::SetForegroundWindow($script:previousWindow)
    $script:previousWindow = [IntPtr]::Zero
  }
}

$countdownTimer = New-Object System.Windows.Threading.DispatcherTimer
$countdownTimer.Interval = [TimeSpan]::FromMilliseconds(250)
$countdownTimer.Add_Tick({
  if ($script:sessionState -ne "running" -or -not $script:sessionStart) { return }
  $elapsed = ((Get-Date) - $script:sessionStart).TotalSeconds
  $remaining = [Math]::Max(0, $script:sessionDurationSeconds - $elapsed)
  $countdownText.Text = Format-Duration([int][Math]::Ceiling($remaining))
  # One gong, the moment the countdown reaches zero. $script:gongPlayed guards
  # against firing again on every later tick, since remaining stays at 0 until
  # Done is clicked. Play() is async so a hidden window's tick loop is never
  # blocked waiting on audio.
  if ($remaining -le 0 -and -not $script:gongPlayed) {
    $script:gongPlayed = $true
    Play-EyeRestGong
  }
})

# While the running panel is visible, keyboard focus belongs to this window -
# the user is typing with their eyes shut and cannot see that a notification or
# another app took the foreground. Any focus loss in that state is treated as
# an accident: beep so it is audible with eyes closed, take the foreground
# back, and put the caret back in the journal box. Leaving deliberately is what
# Esc (hide) is for; the review panel is eyes-open and is not guarded.
$focusWatchdog = New-Object System.Windows.Threading.DispatcherTimer
$focusWatchdog.Interval = [TimeSpan]::FromMilliseconds(300)
$focusWatchdog.Add_Tick({
  if ($script:sessionState -ne "running" -or -not $window.IsVisible) {
    $script:focusLossAnnounced = $false
    $script:focusGrabFailures = 0
    $script:screenLocked = $false
    return
  }
  if ($script:windowHandle -eq [IntPtr]::Zero) { return }

  # A break spent meditating rather than typing lets the display sleep and the
  # session lock. The lock screen owns the input desktop, so every grab below
  # fails, and left unguarded the watchdog turns an unattended break into an
  # alarm: an exclamation chime every two seconds plus a synthetic ALT tap every
  # 300ms from ForceForeground, which wakes the display straight back up. None
  # of it is a stolen foreground and none of it can be won, so go quiet and let
  # the countdown finish; the gong still sounds through the lock screen.
  if ([EyeRestHotkeyListener]::IsInputDesktopUnreachable()) {
    if (-not $script:screenLocked) {
      $script:screenLocked = $true
      $runningStatusText.Text = "Screen locked at " + (Get-Date).ToString("h:mm:ss tt") +
        " - the countdown kept running and focus comes back when you unlock."
    }
    return
  }
  if ($script:screenLocked) {
    # Back on the normal desktop. Take the window and the caret back once, in
    # silence - a lock the user chose is not a theft and does not earn the beep.
    $script:screenLocked = $false
    $script:focusLossAnnounced = $false
    $script:focusGrabFailures = 0
    if ([EyeRestHotkeyListener]::ForceForeground($script:windowHandle)) {
      [void]$journalBox.Focus()
      $journalBox.CaretIndex = $journalBox.Text.Length
    }
    return
  }

  if ([EyeRestHotkeyListener]::GetForegroundWindow() -eq $script:windowHandle) {
    $script:focusGrabFailures = 0
    if ($script:focusLossAnnounced) {
      $script:focusLossAnnounced = $false
      if (-not $window.IsKeyboardFocusWithin) {
        [void]$journalBox.Focus()
        $journalBox.CaretIndex = $journalBox.Text.Length
      }
    }
    return
  }
  if (-not $script:focusLossAnnounced) {
    $script:focusLossAnnounced = $true
    # The status line keeps a visible record for when the eyes open again.
    $runningStatusText.Text = "Focus was stolen at " + (Get-Date).ToString("h:mm:ss tt") +
      " and grabbed back - check for a keystroke or two that went elsewhere."
  }
  # Some foregrounds cannot be taken back at all - an elevated window, an
  # exclusive fullscreen app, anything the lock check above does not catch. Ten
  # failures is about three seconds of beeping, which is alert enough; past that
  # the sound carries no new information, so drop to a silent retry every five
  # seconds rather than chiming for the rest of the break.
  $now = Get-Date
  $givenUp = $script:focusGrabFailures -ge 10
  # Never beep over the gong. Both sounds share the process's single PlaySound
  # channel, so a beep here cancels a gong in progress - and of the two, the one
  # saying "your break is over" is the one that must survive. The grab below
  # still runs; only the sound stands down.
  $gongSounding = $now -lt $script:gongUntil
  if (-not $givenUp -and -not $gongSounding -and ($now - $script:lastFocusBeep).TotalSeconds -ge 2) {
    $script:lastFocusBeep = $now
    try { [System.Media.SystemSounds]::Exclamation.Play() } catch {}
  }
  if ($givenUp -and ($now - $script:lastFocusGrab).TotalSeconds -lt 5) { return }
  $script:lastFocusGrab = $now
  if ([EyeRestHotkeyListener]::ForceForeground($script:windowHandle)) {
    $script:focusGrabFailures = 0
    [void]$journalBox.Focus()
    $journalBox.CaretIndex = $journalBox.Text.Length
  } else {
    $script:focusGrabFailures++
    if ($script:focusGrabFailures -eq 10) {
      $runningStatusText.Text = "Focus was stolen at " + (Get-Date).ToString("h:mm:ss tt") +
        " and could not be grabbed back - anything typed since then went elsewhere."
    }
  }
})
$focusWatchdog.Start()

$draftTimer = New-Object System.Windows.Threading.DispatcherTimer
$draftTimer.Interval = [TimeSpan]::FromSeconds(3)
$draftTimer.Add_Tick({
  if (-not $script:draftDirty) { return }
  $script:draftDirty = $false
  try { Set-Content -LiteralPath $draftPath -Value $journalBox.Text -Encoding UTF8 } catch {}
})
$draftTimer.Start()

# Focus lands on the journal box, not the Length box: the window is meant to be
# typed into with the eyes shut the moment it appears, and the countdown length
# is a rare, deliberate edit that can wait for a click.
function Show-RunningPanel {
  $reviewPanel.Visibility = "Collapsed"
  $runningPanel.Visibility = "Visible"
  Show-EyeRestWindow
  $journalBox.Focus()
  $journalBox.CaretIndex = $journalBox.Text.Length
}

function Show-ReviewPanel {
  $runningPanel.Visibility = "Collapsed"
  $reviewPanel.Visibility = "Visible"
  Show-EyeRestWindow
  $customBox.Focus()
}

function Start-EyeRestSession {
  $script:sessionStart = Get-Date
  $script:sessionEnd = $null
  $script:sessionState = "running"
  $countdownText.Text = Format-Duration($script:sessionDurationSeconds)
  $durationBox.Text = Format-Duration($script:sessionDurationSeconds)
  $runningStatusText.Text = $runningDefaultStatus
  $choiceMeditated.IsChecked = $false
  $choiceBlindJournal.IsChecked = $false
  $choiceSatLooked.IsChecked = $false
  $choiceWalked.IsChecked = $false
  $customBox.Text = ""
  $journalBox.Text = ""
  $journalSummaryText.Visibility = "Collapsed"
  $script:writingStart = $null
  $script:writingEnd = $null
  $script:journalExported = $false
  $script:restLogged = $false
  $script:gongPlayed = $false
  $script:sessionOutcome = ""
  Write-EyeRestState "running"
  Start-KeepAwake
  $countdownTimer.Start()
  Show-RunningPanel
}

function Apply-DurationEdit {
  $parsed = Parse-DurationText($durationBox.Text)
  if ($null -eq $parsed -or $parsed -lt 15 -or $parsed -gt 3600) {
    $durationBox.Text = Format-Duration($script:sessionDurationSeconds)
    return
  }
  $script:sessionDurationSeconds = $parsed
  $durationBox.Text = Format-Duration($parsed)
  # A longer break moves the keep-awake floor with it. Guarded on the request
  # still being held, so a length change after the cap has already expired does
  # not quietly revive it.
  if ($script:keepAwakeOn) { Start-KeepAwake }
  # Re-arm the gong on any manual length change: shrinking it below the
  # already-elapsed time should ring it right away on the next tick, and
  # growing it back past a rung zero should let it ring again when the new
  # target is reached.
  $script:gongPlayed = $false
  Save-EyeRestSettings
}

function Click-Done {
  $script:sessionEnd = Get-Date
  $countdownTimer.Stop()
  $script:sessionState = "review"
  Write-EyeRestState "review"
  $elapsedSeconds = [int][Math]::Round(($script:sessionEnd - $script:sessionStart).TotalSeconds)
  $elapsedText.Text = "You rested for " + (Format-Duration($elapsedSeconds)) + "."
  $reviewStatusText.Text = Format-CaptureStatusWithOutbox $reviewDefaultStatus

  # Words in the box are self-evident proof of how the eyes were rested, so the
  # checkbox is ticked rather than asked for again.
  if ($journalBox.Text.Trim()) {
    $choiceBlindJournal.IsChecked = $true
    if (-not $script:writingEnd) { $script:writingEnd = $script:sessionEnd }
    $journalSummaryText.Text = "Blind journaling (" +
      $script:writingStart.ToString("h:mm tt") + " - " + $script:writingEnd.ToString("h:mm tt") +
      ") goes into that day's document when you log this."
    $journalSummaryText.Visibility = "Visible"
  } else {
    $journalSummaryText.Visibility = "Collapsed"
  }

  Show-ReviewPanel
}

function Reset-ToIdle {
  $countdownTimer.Stop()
  Stop-KeepAwake
  $script:sessionState = "idle"
  $script:sessionStart = $null
  $script:sessionEnd = $null
  Write-EyeRestState "idle"
  $script:sessionOutcome = ""
  Hide-EyeRestWindow
}

function Submit-EyeRest {
  $queuedOffline = $false
  $restTypes = @()
  if ($choiceMeditated.IsChecked) { $restTypes += "Closed eyes and meditated" }
  if ($choiceBlindJournal.IsChecked) { $restTypes += "Blind journaling" }
  if ($choiceSatLooked.IsChecked) { $restTypes += "Sat and looked around" }
  if ($choiceWalked.IsChecked) { $restTypes += "Walked and looked around" }
  $note = $customBox.Text.Trim()

  if ($restTypes.Count -eq 0 -and -not $note) {
    $reviewStatusText.Text = "Pick how you rested, or write it in."
    return
  }

  # The journal block goes first and is flagged done, so a failure on the second
  # POST leaves a retry that only re-sends the rest event. Neither half is ever
  # written twice.
  $journalText = $journalBox.Text.Trim()
  if ($journalText -and -not $script:journalExported) {
    if (-not $script:writingStart) { $script:writingStart = $script:sessionStart }
    if (-not $script:writingEnd) { $script:writingEnd = $script:sessionEnd }
    $journalPayload = @{
      startedAt = $script:writingStart.ToUniversalTime().ToString("o")
      endedAt = $script:writingEnd.ToUniversalTime().ToString("o")
      # The day the writing began, not the server's today: a break that runs
      # past midnight belongs to the document it was started in.
      date = $script:writingStart.ToString("yyyy-MM-dd")
      title = "Blind journaling"
      text = $journalText
    }
    $journalResult = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/quick-journal" -Payload $journalPayload
    if ($journalResult.status -eq "rejected") {
      $reviewStatusText.Text = "The server rejected the writing. Your session is kept."
      return
    }
    if ($journalResult.status -eq "failed") {
      $reviewStatusText.Text = "Could not reach the server or write to the offline queue. Your session and writing are kept."
      return
    }
    # Queued counts as done: the block is on disk in outbox/ and the flag stops
    # a retry of the rest event from writing it a second time.
    if ($journalResult.status -eq "queued") { $queuedOffline = $true }
    $script:journalExported = $true
  }

  if (-not $script:restLogged) {
    $payload = @{
      startedAt = $script:sessionStart.ToUniversalTime().ToString("o")
      endedAt = $script:sessionEnd.ToUniversalTime().ToString("o")
      restTypes = $restTypes
      note = $note
    }

    $restResult = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/eyerest" -Payload $payload
    if ($restResult.status -eq "rejected") {
      $reviewStatusText.Text = "The server rejected that. Your session is kept."
      return
    }
    if ($restResult.status -eq "failed") {
      $reviewStatusText.Text = "Could not reach the server or write to the offline queue. Your session is kept."
      return
    }
    if ($restResult.status -eq "queued") { $queuedOffline = $true }
    $script:restLogged = $true
  }

  # Everything is on the books, so the crash-recovery draft has done its job.
  # "On the books" includes the outbox: a queued capture is a written file, and
  # holding the window open on top of it would only risk the user re-typing what
  # has already been saved.
  $script:draftDirty = $false
  $script:sessionOutcome = "logged"
  try { Remove-Item -LiteralPath $draftPath -Force } catch {}
  if ($queuedOffline) {
    $reviewStatusText.Text = $captureQueuedStatus
    Start-CaptureNoticeHide -Hide { Reset-ToIdle }
    return
  }
  Reset-ToIdle
}

# Discard is deliberate, but a slipped click on it must not be able to erase
# minutes of eyes-shut typing: the text is parked in eyerest-draft-discarded.txt
# (overwritten per discard) instead of vanishing with the session.
function Discard-EyeRestSession {
  if ($journalBox.Text.Trim()) {
    try { Set-Content -LiteralPath $discardedDraftPath -Value $journalBox.Text -Encoding UTF8 } catch {}
  }
  $script:draftDirty = $false
  $script:sessionOutcome = "discarded"
  try { Remove-Item -LiteralPath $draftPath -Force } catch {}
  Reset-ToIdle
}

$doneButton.Add_Click({ Click-Done })
$discardRunningButton.Add_Click({ Discard-EyeRestSession })
$discardReviewButton.Add_Click({ Discard-EyeRestSession })
$logButton.Add_Click({ Submit-EyeRest })

# First keystroke stamps the start, every later one moves the end. Emptying the
# box does not stamp anything, which is also what keeps the programmatic clear
# in Start-EyeRestSession from opening a writing window nobody typed in.
$journalBox.Add_TextChanged({
  if (-not $journalBox.Text.Trim()) { return }
  $script:draftDirty = $true
  $now = Get-Date
  if (-not $script:writingStart) { $script:writingStart = $now }
  $script:writingEnd = $now
})

$durationBox.Add_LostFocus({ Apply-DurationEdit })
$durationBox.Add_PreviewKeyDown({
  param($sender, $keyEvent)
  if ($keyEvent.Key -eq [System.Windows.Input.Key]::Return -or $keyEvent.Key -eq [System.Windows.Input.Key]::Enter) {
    $keyEvent.Handled = $true
    Apply-DurationEdit
  }
})

$window.Add_PreviewKeyDown({
  param($sender, $keyEvent)
  if ($keyEvent.Key -eq [System.Windows.Input.Key]::Escape) {
    $keyEvent.Handled = $true
    Hide-EyeRestWindow
    return
  }
  $isEnter = $keyEvent.Key -eq [System.Windows.Input.Key]::Return -or $keyEvent.Key -eq [System.Windows.Input.Key]::Enter
  $hasControl = ([System.Windows.Input.Keyboard]::Modifiers -band [System.Windows.Input.ModifierKeys]::Control) -ne 0
  if (-not ($isEnter -and $hasControl)) { return }
  # Plain Enter belongs to the journal box as a newline, so finishing the break
  # from the keyboard is Ctrl+Enter in both stages: once to stop the clock, once
  # to log it.
  if ($script:sessionState -eq "running") {
    $keyEvent.Handled = $true
    Click-Done
    return
  }
  if ($script:sessionState -eq "review") {
    $keyEvent.Handled = $true
    Submit-EyeRest
  }
})

# Deliberately no hide-on-deactivate, matching mistake-capture.ps1: if the
# foreground grab loses a race the window would vanish the instant it appeared
# and the hotkey would look dead.
$window.Add_Closing({
  param($sender, $closeEvent)
  $closeEvent.Cancel = $true
  Hide-EyeRestWindow
})

$listener = New-Object EyeRestHotkeyListener
$listener.add_HotKeyPressed({
  switch ($script:sessionState) {
    "idle" { Start-EyeRestSession }
    "running" { Show-RunningPanel }
    "review" { Show-ReviewPanel }
  }
})

# MOD_ALT 0x1 | MOD_CONTROL 0x2 | MOD_SHIFT 0x4 | MOD_NOREPEAT 0x4000.
# Tries Ctrl+Alt+E first, then a small set of similar fallbacks if something
# else already owns it, so the listener still comes up with a working hotkey.
$attempts = @(
  @{ Name = "Ctrl+Alt+E"; Modifiers = 0x4003; Key = 0x45 },
  @{ Name = "Ctrl+Alt+R"; Modifiers = 0x4003; Key = 0x52 },
  @{ Name = "Ctrl+Shift+Alt+E"; Modifiers = 0x4007; Key = 0x45 },
  @{ Name = "Ctrl+Alt+Y"; Modifiers = 0x4003; Key = 0x59 }
)

$registeredName = $null
foreach ($attempt in $attempts) {
  if ($listener.Register(1, [uint32]$attempt.Modifiers, [uint32]$attempt.Key)) {
    $registeredName = $attempt.Name
    break
  }
}

if (-not $registeredName) {
  [System.Windows.MessageBox]::Show(
    "None of the eye-rest hotkeys (Ctrl+Alt+E, Ctrl+Alt+R, Ctrl+Shift+Alt+E, Ctrl+Alt+Y) are free, so the eye-rest window cannot open. Close whatever owns one of them, or pick a different hotkey in eyerest-capture.ps1.",
    "Event Horizon") | Out-Null
  $listener.Dispose()
  exit
}

if ($registeredName -ne "Ctrl+Alt+E") {
  [System.Windows.MessageBox]::Show(
    "Ctrl+Alt+E was already taken, so eye rest is bound to $registeredName instead.",
    "Event Horizon") | Out-Null
}

try {
  [System.Windows.Threading.Dispatcher]::Run()
} finally {
  $countdownTimer.Stop()
  $focusWatchdog.Stop()
  $draftTimer.Stop()
  $keepAwakeTimer.Stop()
  Stop-KeepAwake
  $listener.Dispose()
  $script:instanceMutex.ReleaseMutex()
  $script:instanceMutex.Dispose()
}
