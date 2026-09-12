param(
  [int]$Port = 8787
)

# Background hotkey listener for the "lessons from experience" log (it began as
# a mistakes-only log, hence the file name, the mutex name and the /api/mistakes
# endpoint, all kept so the startup shortcut and queued captures keep working).
# Runs with no visible window until Ctrl+Alt+W is pressed, then shows a small
# capture window: what I did, whether it went well or badly, and the reflective
# boxes. Ctrl+Enter logs the row and returns focus to whatever you were doing.
#
# Deliberately separate from task-hud.ps1: capture must keep working whether or
# not the task HUD is open.

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
public class MistakeHotkeyListener : NativeWindow, IDisposable {
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

  private const int WM_HOTKEY = 0x0312;
  private const int GWL_EXSTYLE = -20;
  private const int WS_EX_TOOLWINDOW = 0x00000080;
  private const int WS_EX_APPWINDOW = 0x00040000;

  private int hotkeyId = 0;
  private bool registered = false;

  public event EventHandler HotKeyPressed;

  public MistakeHotkeyListener() {
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

  public static void HideFromAltTab(IntPtr hWnd) {
    int style = GetWindowLong(hWnd, GWL_EXSTYLE);
    style = (style & ~WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW;
    SetWindowLong(hWnd, GWL_EXSTYLE, style);
  }
}
"@

# One listener per session, or the second one silently fails to take the hotkey.
$createdMutex = $false
$script:instanceMutex = New-Object System.Threading.Mutex($true, "Local\JournalCaptureMistakeHotkey", [ref]$createdMutex)
if (-not $createdMutex) {
  exit
}

$baseUrl = "http://127.0.0.1:$Port"
. (Join-Path $PSScriptRoot "capture-outbox.ps1")
$script:previousWindow = [IntPtr]::Zero
$script:statusResetTimer = $null

[xml]$xaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Lessons from experience"
  WindowStyle="None"
  AllowsTransparency="True"
  Background="Transparent"
  ResizeMode="NoResize"
  Topmost="True"
  ShowInTaskbar="False"
  ShowActivated="True"
  SizeToContent="Height"
  Width="520"
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
      <Setter Property="AcceptsReturn" Value="True"/>
      <Setter Property="TextWrapping" Value="Wrap"/>
      <Setter Property="MinHeight" Value="34"/>
      <Setter Property="MaxHeight" Value="90"/>
      <Setter Property="VerticalScrollBarVisibility" Value="Auto"/>
      <Setter Property="Margin" Value="0,0,0,10"/>
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
      <TextBlock Text="Lessons from experience"
                 Foreground="#F1FAF7"
                 FontSize="14"
                 FontWeight="Bold"
                 Margin="0,0,0,2"/>
      <TextBlock x:Name="SubtitleText"
                 Text="A good call or a bad one. Only the first box is needed; fill in the rest tonight."
                 Foreground="#7C9B97"
                 FontSize="11"
                 Margin="0,0,0,12"/>

      <TextBlock Text="What I did" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="WhatBox" Style="{StaticResource FieldBox}"/>

      <TextBlock Text="How it turned out (optional, decide tonight if unsure)" Style="{StaticResource FieldLabel}"/>
      <StackPanel Orientation="Horizontal" Margin="0,0,0,10">
        <RadioButton x:Name="GoodRadio"
                     GroupName="Outcome"
                     Content="Went well"
                     Foreground="#B9D6D1"
                     FontSize="12"
                     Margin="0,0,18,0"
                     VerticalContentAlignment="Center"/>
        <RadioButton x:Name="BadRadio"
                     GroupName="Outcome"
                     Content="Went badly"
                     Foreground="#B9D6D1"
                     FontSize="12"
                     VerticalContentAlignment="Center"/>
      </StackPanel>

      <TextBlock Text="What it led to" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="ProblemBox" Style="{StaticResource FieldBox}"/>

      <TextBlock Text="Why I think I did it" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="WhyBox" Style="{StaticResource FieldBox}"/>

      <TextBlock Text="Alternative explanation" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="AlternativeBox" Style="{StaticResource FieldBox}"/>

      <TextBlock Text="What I can do next time" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="NextTimeBox" Style="{StaticResource FieldBox}"/>

      <CheckBox x:Name="TodayCheck"
                Content="This happened today"
                IsChecked="True"
                Foreground="#B9D6D1"
                FontSize="11"
                Margin="0,0,0,6"/>
      <StackPanel x:Name="WhenPanel" Visibility="Collapsed" Margin="0,0,0,8">
        <TextBlock Text="When it happened (YYYY-MM-DD)" Style="{StaticResource FieldLabel}"/>
        <TextBox x:Name="WhenBox" Style="{StaticResource FieldBox}"/>
      </StackPanel>

      <Grid Margin="0,2,0,0">
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>
        <TextBlock x:Name="StatusText"
                   Grid.Column="0"
                   Text="Ctrl+Enter to log - Esc to close"
                   Foreground="#7C9B97"
                   FontSize="11"
                   TextWrapping="Wrap"
                   VerticalAlignment="Center"/>
        <Button x:Name="LogButton"
                Grid.Column="1"
                Content="Log it"
                Padding="14,5,14,5"
                Background="#1F8C7C"
                Foreground="#F7FFFB"
                BorderThickness="0"
                Cursor="Hand"/>
      </Grid>
    </StackPanel>
  </Border>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

$whatBox = $window.FindName("WhatBox")
$goodRadio = $window.FindName("GoodRadio")
$badRadio = $window.FindName("BadRadio")
$problemBox = $window.FindName("ProblemBox")
$whyBox = $window.FindName("WhyBox")
$alternativeBox = $window.FindName("AlternativeBox")
$nextTimeBox = $window.FindName("NextTimeBox")
$statusText = $window.FindName("StatusText")
$subtitleText = $window.FindName("SubtitleText")
$logButton = $window.FindName("LogButton")
$todayCheck = $window.FindName("TodayCheck")
$whenPanel = $window.FindName("WhenPanel")
$whenBox = $window.FindName("WhenBox")

# Ticked is the common case and stays ticked; the date box only exists for the
# "I made this mistake on Tuesday and I am writing it down on Friday" case. The
# distinction is not cosmetic: a back-dated row must not claim it happened at the
# hour it was typed, or the time-of-day pattern in the data is invented.
$todayCheck.Add_Checked({ $whenPanel.Visibility = "Collapsed" })
$todayCheck.Add_Unchecked({
  $whenPanel.Visibility = "Visible"
  if (-not $whenBox.Text.Trim()) {
    $whenBox.Text = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
  }
  $whenBox.Focus()
  $whenBox.CaretIndex = $whenBox.Text.Length
})

$defaultStatus = "Ctrl+Enter to log - Esc to close"

function Set-CaptureStatus {
  param([string]$Message)
  $statusText.Text = $Message
}

# Converts System.Windows.Forms pixel coordinates into the WPF device-independent
# units used by Window.Left/Top. Deriving it from two values read in this same
# process is correct whether or not the process ended up DPI aware; Graphics.DpiX
# is not, because it reports monitor DPI even when Forms is handing back
# already-virtualized coordinates.
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

# Open on whichever monitor the pointer is on, a little above centre so the
# window does not sit on top of whatever prompted the entry.
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
  if ($height -le 0) { $height = 420 }
  $top = ($area.Top / $scale) + ((($area.Height / $scale) - $height) / 3)
  $window.Left = [Math]::Round($left)
  $window.Top = [Math]::Round([Math]::Max($top, ($area.Top / $scale) + 20))
}

function Show-CaptureWindow {
  $script:previousWindow = [MistakeHotkeyListener]::GetForegroundWindow()
  Set-CaptureStatus (Format-CaptureStatusWithOutbox $defaultStatus)
  $subtitleText.Text = "Logging to " + (Get-Date -Format "dddd, MMMM d") + ". Only the first box is needed."
  # Positioned before Show so it does not appear at the default spot and jump,
  # then again once layout has given the window its real height.
  Set-CaptureWindowPosition
  $window.Show()
  Set-CaptureWindowPosition
  $window.Activate()
  try {
    $handle = (New-Object System.Windows.Interop.WindowInteropHelper($window)).Handle
    [MistakeHotkeyListener]::HideFromAltTab($handle)
    [void][MistakeHotkeyListener]::SetForegroundWindow($handle)
  } catch {
    # Activation is best effort; the window is still usable with the mouse.
  }
  $whatBox.Focus()
  $whatBox.CaretIndex = $whatBox.Text.Length
}

# Hiding never clears the boxes, so an accidental Esc cannot lose typing. Only a
# successful log resets them.
function Hide-CaptureWindow {
  $window.Hide()
  if ($script:previousWindow -ne [IntPtr]::Zero) {
    [void][MistakeHotkeyListener]::SetForegroundWindow($script:previousWindow)
    $script:previousWindow = [IntPtr]::Zero
  }
}

# Nothing selected is a valid answer and is sent as "": deciding whether it was
# a good call is reflection, and the capture never waits on it.
function Get-SelectedOutcome {
  if ($goodRadio.IsChecked) { return "good" }
  if ($badRadio.IsChecked) { return "bad" }
  return ""
}

function Submit-Mistake {
  $what = $whatBox.Text.Trim()
  if (-not $what) {
    Set-CaptureStatus "Write what you did first."
    $whatBox.Focus()
    return
  }

  # Resolved at submit time, not at launch: this process runs for days.
  $happenedToday = [bool]$todayCheck.IsChecked
  $when = (Get-Date -Format "yyyy-MM-dd")
  if (-not $happenedToday) {
    $typed = $whenBox.Text.Trim()
    $parsed = [datetime]::MinValue
    $ok = [datetime]::TryParseExact(
      $typed,
      "yyyy-MM-dd",
      [Globalization.CultureInfo]::InvariantCulture,
      [Globalization.DateTimeStyles]::None,
      [ref]$parsed)
    if (-not $ok) {
      Set-CaptureStatus "Write the date as YYYY-MM-DD, or tick 'This happened today'."
      $whenBox.Focus()
      return
    }
    if ($parsed.Date -gt (Get-Date).Date) {
      Set-CaptureStatus "That date is in the future."
      $whenBox.Focus()
      return
    }
    $when = $parsed.ToString("yyyy-MM-dd")
  }

  $payload = @{
    date = $when
    happenedToday = $happenedToday
    what = $what
    outcome = (Get-SelectedOutcome)
    problem = $problemBox.Text.Trim()
    why = $whyBox.Text.Trim()
    alternative = $alternativeBox.Text.Trim()
    nextTime = $nextTimeBox.Text.Trim()
  }

  $result = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/mistakes" -Payload $payload

  if ($result.status -eq "rejected") {
    Set-CaptureStatus "The server rejected that. Your text is kept."
    return
  }
  if ($result.status -eq "failed") {
    Set-CaptureStatus "Could not reach the server or write to the offline queue. Your text is kept."
    return
  }

  # "sent" and "queued" are the same outcome from here: the capture is on the
  # books either way, so the window closes on both. It is never held open
  # waiting for a server to come back.

  $whatBox.Text = ""
  $goodRadio.IsChecked = $false
  $badRadio.IsChecked = $false
  $problemBox.Text = ""
  $whyBox.Text = ""
  $alternativeBox.Text = ""
  $nextTimeBox.Text = ""
  # Back-dating is per-row, never sticky: the next Ctrl+Alt+W is far more
  # likely to be something that just happened.
  $whenBox.Text = ""
  $todayCheck.IsChecked = $true
  if ($result.status -eq "queued") {
    Set-CaptureStatus $captureQueuedStatus
    Start-CaptureNoticeHide -Hide { Hide-CaptureWindow }
    return
  }
  Hide-CaptureWindow
}

$logButton.Add_Click({ Submit-Mistake })

$window.Add_PreviewKeyDown({
  param($sender, $keyEvent)
  if ($keyEvent.Key -eq [System.Windows.Input.Key]::Escape) {
    $keyEvent.Handled = $true
    Hide-CaptureWindow
    return
  }
  $isEnter = $keyEvent.Key -eq [System.Windows.Input.Key]::Return -or $keyEvent.Key -eq [System.Windows.Input.Key]::Enter
  $hasControl = ([System.Windows.Input.Keyboard]::Modifiers -band [System.Windows.Input.ModifierKeys]::Control) -ne 0
  if ($isEnter -and $hasControl) {
    $keyEvent.Handled = $true
    Submit-Mistake
  }
})

# Deliberately no hide-on-deactivate. If the foreground grab loses a race the
# window would vanish the instant it appeared and the hotkey would look dead.
# Esc, Ctrl+Enter and the Log button are the only ways out.
$window.Add_Closing({
  param($sender, $closeEvent)
  $closeEvent.Cancel = $true
  Hide-CaptureWindow
})

$listener = New-Object MistakeHotkeyListener
$listener.add_HotKeyPressed({
  if ($window.IsVisible) {
    $window.Activate()
    $whatBox.Focus()
  } else {
    Show-CaptureWindow
  }
})

# MOD_ALT 0x1 | MOD_CONTROL 0x2 | MOD_NOREPEAT 0x4000, VK_W 0x57
$registered = $listener.Register(0xB17, 0x4003, 0x57)
if (-not $registered) {
  [System.Windows.MessageBox]::Show(
    "Ctrl+Alt+W is already taken by another program, so the lessons capture window cannot open. Close whatever owns it, or pick a different hotkey in mistake-capture.ps1.",
    "Event Horizon") | Out-Null
  $listener.Dispose()
  exit
}

try {
  [System.Windows.Threading.Dispatcher]::Run()
} finally {
  $listener.Dispose()
  $script:instanceMutex.ReleaseMutex()
  $script:instanceMutex.Dispose()
}
