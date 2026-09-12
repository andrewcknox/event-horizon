param(
  [int]$Port = 8787
)

# Background hotkey listener for the "things to learn about" list. Runs with no
# visible window until Ctrl+Alt+L is pressed (or a fallback combo if that one is
# taken), then shows a small box: what to learn, plus an optional link for where
# to learn it. Esc hides without losing the draft - the point is to catch a
# passing curiosity the moment it shows up, so an accidental Esc must not cost
# what was already typed.
#
# Deliberately separate from the other capture listeners: this must keep working
# whether or not mistake-capture.ps1, eyerest-capture.ps1 or
# quick-journal-capture.ps1 are running.

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
public class LearnHotkeyListener : NativeWindow, IDisposable {
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

  public LearnHotkeyListener() {
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
$script:instanceMutex = New-Object System.Threading.Mutex($true, "Local\JournalCaptureLearnHotkey", [ref]$createdMutex)
if (-not $createdMutex) {
  exit
}

$baseUrl = "http://127.0.0.1:$Port"
. (Join-Path $PSScriptRoot "capture-outbox.ps1")

# $false = no draft in progress. Set the moment a fresh session starts and
# cleared only on a successful save or an explicit Discard - never by Esc.
$script:sessionOpen = $false
$script:previousWindow = [IntPtr]::Zero

[xml]$xaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Learn about"
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
    <Style x:Key="FieldBox" TargetType="TextBox">
      <Setter Property="Background" Value="#1B2828"/>
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="BorderBrush" Value="#39534F"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="9,7,9,7"/>
      <Setter Property="FontSize" Value="14"/>
      <Setter Property="CaretBrush" Value="#7FE3D2"/>
      <Setter Property="AcceptsReturn" Value="True"/>
      <Setter Property="TextWrapping" Value="Wrap"/>
      <Setter Property="MinHeight" Value="96"/>
      <Setter Property="MaxHeight" Value="260"/>
      <Setter Property="VerticalScrollBarVisibility" Value="Auto"/>
      <Setter Property="Margin" Value="0,0,0,10"/>
    </Style>
    <Style x:Key="LinkBox" TargetType="TextBox">
      <Setter Property="Background" Value="#1B2828"/>
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="BorderBrush" Value="#39534F"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="9,6,9,6"/>
      <Setter Property="FontSize" Value="12"/>
      <Setter Property="CaretBrush" Value="#7FE3D2"/>
      <Setter Property="AcceptsReturn" Value="False"/>
      <Setter Property="TextWrapping" Value="NoWrap"/>
      <Setter Property="Margin" Value="0,0,0,10"/>
    </Style>
    <Style x:Key="FieldLabel" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#7C9B97"/>
      <Setter Property="FontSize" Value="11"/>
      <Setter Property="Margin" Value="0,0,0,4"/>
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
      <TextBlock Text="Learn about"
                 Foreground="#F1FAF7"
                 FontSize="14"
                 FontWeight="Bold"
                 Margin="0,0,0,2"/>
      <TextBlock x:Name="SubtitleText"
                 Text="Goes on the list to learn about sometime."
                 Foreground="#7C9B97"
                 FontSize="11"
                 Margin="0,0,0,12"/>

      <TextBox x:Name="TextBox" Style="{StaticResource FieldBox}"/>

      <TextBlock Text="Link (optional)" Style="{StaticResource FieldLabel}"/>
      <TextBox x:Name="LinkBox" Style="{StaticResource LinkBox}"/>

      <Grid>
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="Auto"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>
        <TextBlock x:Name="StatusText"
                   Grid.Column="0"
                   Text="Ctrl+Enter to save - Esc to hide"
                   Foreground="#7C9B97"
                   FontSize="11"
                   TextWrapping="Wrap"
                   VerticalAlignment="Center"/>
        <Button x:Name="DiscardButton"
                Grid.Column="1"
                Content="Discard"
                Style="{StaticResource QuietButton}"
                Margin="0,0,6,0"/>
        <Button x:Name="SaveButton"
                Grid.Column="2"
                Content="Add it"
                Style="{StaticResource ActionButton}"/>
      </Grid>
    </StackPanel>
  </Border>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

$textBox = $window.FindName("TextBox")
$linkBox = $window.FindName("LinkBox")
$statusText = $window.FindName("StatusText")
$subtitleText = $window.FindName("SubtitleText")
$discardButton = $window.FindName("DiscardButton")
$saveButton = $window.FindName("SaveButton")

$defaultStatus = "Ctrl+Enter to save - Esc to hide"
$defaultSubtitle = "Goes on the list to learn about sometime."

function Set-CaptureStatus {
  param([string]$Message)
  $statusText.Text = $Message
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

# The usual case is "I am looking at the thing right now", so a URL already on
# the clipboard is almost always the link that belongs here. Only ever fills a
# fresh session, and says so, so it is obvious enough to clear.
function Get-ClipboardUrl {
  try {
    $text = [System.Windows.Clipboard]::GetText()
  } catch {
    return ""
  }
  $text = ($text -replace "\s", "")
  if ($text -match "^https?://\S+$") {
    return $text
  }
  return ""
}

function Show-CaptureWindow {
  $script:previousWindow = [LearnHotkeyListener]::GetForegroundWindow()
  if (-not $script:sessionOpen) {
    $script:sessionOpen = $true
    $textBox.Text = ""
    $linkBox.Text = ""
    Set-CaptureStatus (Format-CaptureStatusWithOutbox $defaultStatus)
    $subtitleText.Text = $defaultSubtitle
    $clipboardUrl = Get-ClipboardUrl
    if ($clipboardUrl) {
      $linkBox.Text = $clipboardUrl
      $subtitleText.Text = "Link filled from your clipboard - clear it if it is not the one."
    }
  }
  # Positioned before Show so it does not appear at the default spot and jump,
  # then again once layout has given the window its real height.
  Set-CaptureWindowPosition
  $window.Show()
  Set-CaptureWindowPosition
  $window.Activate()
  try {
    $handle = (New-Object System.Windows.Interop.WindowInteropHelper($window)).Handle
    [LearnHotkeyListener]::HideFromAltTab($handle)
    [void][LearnHotkeyListener]::SetForegroundWindow($handle)
  } catch {
    # Activation is best effort; the window is still usable with the mouse.
  }
  $textBox.Focus()
  $textBox.CaretIndex = $textBox.Text.Length
}

# Hiding never touches the draft, so Esc cannot lose a half-typed idea. Only a
# successful save or Discard clears it.
function Hide-CaptureWindow {
  $window.Hide()
  if ($script:previousWindow -ne [IntPtr]::Zero) {
    [void][LearnHotkeyListener]::SetForegroundWindow($script:previousWindow)
    $script:previousWindow = [IntPtr]::Zero
  }
}

function Clear-Session {
  $textBox.Text = ""
  $linkBox.Text = ""
  $script:sessionOpen = $false
  $subtitleText.Text = $defaultSubtitle
  Set-CaptureStatus $defaultStatus
}

function Discard-Session {
  Clear-Session
  Hide-CaptureWindow
}

function Submit-LearnItem {
  $text = $textBox.Text.Trim()
  $link = $linkBox.Text.Trim()
  if (-not $text -and -not $link) {
    Set-CaptureStatus "Write something to learn about, or paste a link."
    $textBox.Focus()
    return
  }

  $payload = @{
    text = $text
    link = $link
    createdAt = (Get-Date).ToUniversalTime().ToString("o")
    source = "hotkey"
  }

  $result = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/learn-list" -Payload $payload

  if ($result.status -eq "rejected") {
    Set-CaptureStatus "The server rejected that. Your draft is kept."
    return
  }
  if ($result.status -eq "failed") {
    Set-CaptureStatus "Could not reach the server or write to the offline queue. Your draft is kept."
    return
  }

  # "sent" and "queued" are the same outcome from here: the capture is on the
  # books either way, so the window closes on both. It is never held open
  # waiting for a server to come back.

  Clear-Session
  if ($result.status -eq "queued") {
    Set-CaptureStatus $captureQueuedStatus
    Start-CaptureNoticeHide -Hide { Hide-CaptureWindow }
    return
  }
  Hide-CaptureWindow
}

$saveButton.Add_Click({ Submit-LearnItem })
$discardButton.Add_Click({ Discard-Session })

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
    Submit-LearnItem
  }
})

# The link box is single-line, so a bare Enter there means "done" rather than
# "new paragraph".
$linkBox.Add_KeyDown({
  param($sender, $keyEvent)
  $isEnter = $keyEvent.Key -eq [System.Windows.Input.Key]::Return -or $keyEvent.Key -eq [System.Windows.Input.Key]::Enter
  if ($isEnter) {
    $keyEvent.Handled = $true
    Submit-LearnItem
  }
})

# Deliberately no hide-on-deactivate, matching the other capture windows: if the
# foreground grab loses a race the window would vanish the instant it appeared
# and the hotkey would look dead.
$window.Add_Closing({
  param($sender, $closeEvent)
  $closeEvent.Cancel = $true
  Hide-CaptureWindow
})

$listener = New-Object LearnHotkeyListener
$listener.add_HotKeyPressed({
  if ($window.IsVisible) {
    $window.Activate()
    $textBox.Focus()
  } else {
    Show-CaptureWindow
  }
})

# MOD_ALT 0x1 | MOD_CONTROL 0x2 | MOD_SHIFT 0x4 | MOD_NOREPEAT 0x4000.
# Tries Ctrl+Alt+L first, then a small set of similar fallbacks if something
# else already owns it, so the listener still comes up with a working hotkey.
# None of these collide with the other capture tools (Q/J/U, W, E/R/Y).
$attempts = @(
  @{ Name = "Ctrl+Alt+L"; Modifiers = 0x4003; Key = 0x4C },
  @{ Name = "Ctrl+Shift+Alt+L"; Modifiers = 0x4007; Key = 0x4C },
  @{ Name = "Ctrl+Alt+B"; Modifiers = 0x4003; Key = 0x42 },
  @{ Name = "Ctrl+Alt+N"; Modifiers = 0x4003; Key = 0x4E }
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
    "None of the learn-about hotkeys (Ctrl+Alt+L, Ctrl+Shift+Alt+L, Ctrl+Alt+B, Ctrl+Alt+N) are free, so the learn window cannot open. Close whatever owns one of them, or pick a different hotkey in learn-capture.ps1.",
    "Event Horizon") | Out-Null
  $listener.Dispose()
  exit
}

if ($registeredName -ne "Ctrl+Alt+L") {
  [System.Windows.MessageBox]::Show(
    "Ctrl+Alt+L was already taken, so the learn list is bound to $registeredName instead.",
    "Event Horizon") | Out-Null
}

try {
  [System.Windows.Threading.Dispatcher]::Run()
} finally {
  $listener.Dispose()
  $script:instanceMutex.ReleaseMutex()
  $script:instanceMutex.Dispose()
}
