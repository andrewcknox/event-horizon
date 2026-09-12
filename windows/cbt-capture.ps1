param(
  [int]$Port = 8787
)

# Background hotkey listener for CBT thought records. Runs with no visible
# window until Ctrl+Alt+C is pressed, then shows the Daily Mood Log from David
# Burns' The Feeling Good Handbook, in the book's own order: upsetting event ->
# emotions rated 0-100% before and after -> negative thoughts, each with a
# belief rating, its distortions ticked off the ten-item list, and a positive
# (rational) response with its own belief rating -> outcome. Ctrl+Enter files it
# into the day's Document view through POST /api/quick-journal with title
# "Thought record", the same append path the eye-rest blind journaling uses, so
# the record shows up in the journal exactly like those blocks do.
#
# The March review graded CBT -4/-2/-1 with the note "I've kind of forgotten
# how to do that. I need to get the template back." This window is the
# template, which is why it follows the book rather than a shortened version of
# it. Only the upsetting event and the first negative thought are required -
# half a mood log beats none, same philosophy as the mistake capture. The
# before/after percentages are the measurement the book is built around, but a
# record with none of them still files.
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
public class CbtHotkeyListener : NativeWindow, IDisposable {
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

  public CbtHotkeyListener() {
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
$script:instanceMutex = New-Object System.Threading.Mutex($true, "Local\JournalCaptureCbtHotkey", [ref]$createdMutex)
if (-not $createdMutex) {
  exit
}

$baseUrl = "http://127.0.0.1:$Port"
. (Join-Path $PSScriptRoot "capture-outbox.ps1")
$script:previousWindow = [IntPtr]::Zero
# Stamped when a fresh session first shows, cleared by a successful log or a
# Discard. Esc keeps it: the draft and its start time survive a hide.
$script:sessionStart = $null

# The Handbook's nine emotion families, in the book's order and wording. They
# are groups rather than single words on purpose: "inferior, worthless,
# inadequate" is one dial, and being asked to score the family is what stops the
# log turning into a thesaurus exercise.
$script:emotionGroups = @(
  "Sad, blue, depressed, down, unhappy",
  "Anxious, worried, panicky, nervous, frightened",
  "Guilty, remorseful, bad, ashamed",
  "Inferior, worthless, inadequate, defective, incompetent",
  "Lonely, unloved, unwanted, rejected, alone, abandoned",
  "Embarrassed, foolish, humiliated, self-conscious",
  "Hopeless, discouraged, pessimistic, despairing",
  "Frustrated, stuck, thwarted, defeated",
  "Angry, mad, resentful, annoyed, irritated, upset, furious"
)

# The ten distortions, with mind reading and fortune telling split out of
# "jumping to conclusions" the way the book's own worksheets list them (5a/5b).
# Short is the chip label, Full is what gets written into the journal, Hint is
# the tooltip so the definition is there at 1am without reaching for the book.
$script:distortions = @(
  @{ Short = "All-or-nothing"; Full = "All-or-nothing thinking"; Hint = "You see things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure." },
  @{ Short = "Overgeneralization"; Full = "Overgeneralization"; Hint = "You see a single negative event as a never-ending pattern of defeat - the words always and never are the giveaway." },
  @{ Short = "Mental filter"; Full = "Mental filter"; Hint = "You pick out one negative detail and dwell on it exclusively, so your vision of the whole situation darkens." },
  @{ Short = "Discounting the positive"; Full = "Discounting the positive"; Hint = "You reject positive experiences by insisting they don't count, so you keep a negative belief no experience can contradict." },
  @{ Short = "Mind reading"; Full = "Mind reading"; Hint = "Jumping to conclusions: you decide someone is reacting badly to you and don't check whether it's true." },
  @{ Short = "Fortune telling"; Full = "Fortune telling"; Hint = "Jumping to conclusions: you predict things will turn out badly and feel the prediction is already an established fact." },
  @{ Short = "Magnification"; Full = "Magnification or minimization"; Hint = "You blow things out of proportion, or shrink them until they look tiny - your own goofs magnified, your own strengths minimized." },
  @{ Short = "Emotional reasoning"; Full = "Emotional reasoning"; Hint = "You take your feelings as evidence: I feel it, therefore it must be true." },
  @{ Short = "Should statements"; Full = "Should statements"; Hint = "You drive yourself with shoulds, musts and oughts, as though you had to be whipped before you could do anything. Aimed at others they produce anger." },
  @{ Short = "Labeling"; Full = "Labeling"; Hint = "Instead of I made a mistake, you attach a label to yourself or someone else: I'm a loser, he's a jerk." },
  @{ Short = "Personalization"; Full = "Personalization and blame"; Hint = "You hold yourself responsible for something you were not entirely responsible for - or blame others and overlook your own part in it." }
)

[xml]$xaml = @"
<Window
  xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
  Title="Daily Mood Log"
  WindowStyle="None"
  AllowsTransparency="True"
  Background="Transparent"
  ResizeMode="NoResize"
  Topmost="True"
  ShowInTaskbar="False"
  ShowActivated="True"
  SizeToContent="Height"
  Width="700"
  UseLayoutRounding="True">
  <Window.Resources>
    <Style x:Key="SectionHead" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="FontSize" Value="12.5"/>
      <Setter Property="FontWeight" Value="Bold"/>
      <Setter Property="Margin" Value="0,4,0,2"/>
    </Style>
    <Style x:Key="HintText" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#7C9B97"/>
      <Setter Property="FontSize" Value="10.5"/>
      <Setter Property="TextWrapping" Value="Wrap"/>
      <Setter Property="Margin" Value="0,0,0,6"/>
    </Style>
    <Style x:Key="FieldLabel" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#8FB3AE"/>
      <Setter Property="FontSize" Value="11"/>
      <Setter Property="FontWeight" Value="SemiBold"/>
      <Setter Property="Margin" Value="0,0,0,3"/>
    </Style>
    <Style x:Key="ColHead" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#7C9B97"/>
      <Setter Property="FontSize" Value="10"/>
      <Setter Property="FontWeight" Value="SemiBold"/>
      <Setter Property="TextAlignment" Value="Center"/>
      <Setter Property="Margin" Value="0,0,0,4"/>
    </Style>
    <Style x:Key="EmotionLabel" TargetType="TextBlock">
      <Setter Property="Foreground" Value="#C9E2DE"/>
      <Setter Property="FontSize" Value="11.5"/>
      <Setter Property="TextWrapping" Value="Wrap"/>
      <Setter Property="VerticalAlignment" Value="Center"/>
      <Setter Property="Margin" Value="0,0,10,4"/>
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
      <Setter Property="MaxHeight" Value="80"/>
      <Setter Property="VerticalScrollBarVisibility" Value="Auto"/>
      <Setter Property="Margin" Value="0,0,0,8"/>
    </Style>
    <Style x:Key="OtherBox" TargetType="TextBox">
      <Setter Property="Background" Value="#1B2828"/>
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="BorderBrush" Value="#39534F"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="6,3,6,3"/>
      <Setter Property="FontSize" Value="11.5"/>
      <Setter Property="CaretBrush" Value="#7FE3D2"/>
      <Setter Property="VerticalAlignment" Value="Center"/>
      <Setter Property="Margin" Value="0,0,10,4"/>
    </Style>
    <Style x:Key="PctBox" TargetType="TextBox">
      <Setter Property="Background" Value="#1B2828"/>
      <Setter Property="Foreground" Value="#F1FAF7"/>
      <Setter Property="BorderBrush" Value="#39534F"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="4,3,4,3"/>
      <Setter Property="FontSize" Value="12"/>
      <Setter Property="Width" Value="50"/>
      <Setter Property="MaxLength" Value="3"/>
      <Setter Property="TextAlignment" Value="Center"/>
      <Setter Property="HorizontalAlignment" Value="Center"/>
      <Setter Property="VerticalAlignment" Value="Center"/>
      <Setter Property="CaretBrush" Value="#7FE3D2"/>
      <Setter Property="Margin" Value="0,0,0,4"/>
    </Style>
    <Style x:Key="ThoughtCard" TargetType="Border">
      <Setter Property="Background" Value="#152121"/>
      <Setter Property="BorderBrush" Value="#2C4441"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="CornerRadius" Value="10"/>
      <Setter Property="Padding" Value="11,9,11,4"/>
      <Setter Property="Margin" Value="0,0,0,8"/>
    </Style>
    <Style x:Key="ChipToggle" TargetType="ToggleButton">
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="Margin" Value="0,0,5,5"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="ToggleButton">
            <Border x:Name="Chip"
                    CornerRadius="9"
                    Background="#1B2828"
                    BorderBrush="#39534F"
                    BorderThickness="1"
                    Padding="8,3,8,3">
              <TextBlock x:Name="ChipText"
                         Text="{TemplateBinding Content}"
                         Foreground="#9FC0BB"
                         FontSize="11"/>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="Chip" Property="BorderBrush" Value="#7FE3D2"/>
              </Trigger>
              <Trigger Property="IsChecked" Value="True">
                <Setter TargetName="Chip" Property="Background" Value="#1F8C7C"/>
                <Setter TargetName="Chip" Property="BorderBrush" Value="#7FE3D2"/>
                <Setter TargetName="ChipText" Property="Foreground" Value="#F7FFFB"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>
    <Style x:Key="SoftButton" TargetType="Button">
      <Setter Property="Background" Value="#233434"/>
      <Setter Property="Foreground" Value="#B9D6D1"/>
      <Setter Property="BorderThickness" Value="0"/>
      <Setter Property="Padding" Value="10,4,10,4"/>
      <Setter Property="FontSize" Value="11"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="HorizontalAlignment" Value="Left"/>
      <Setter Property="Margin" Value="0,0,0,6"/>
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
    <DockPanel Margin="16,14,16,12">
      <StackPanel DockPanel.Dock="Top">
        <TextBlock Text="Daily Mood Log"
                   Foreground="#F1FAF7"
                   FontSize="14"
                   FontWeight="Bold"
                   Margin="0,0,0,2"/>
        <TextBlock x:Name="SubtitleText"
                   Text="The Feeling Good Handbook form. Only the event and the first thought are needed."
                   Foreground="#7C9B97"
                   FontSize="11"
                   Margin="0,0,0,10"/>
      </StackPanel>

      <Grid DockPanel.Dock="Bottom" Margin="0,8,0,0">
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="Auto"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>
        <TextBlock x:Name="StatusText"
                   Grid.Column="0"
                   Text="Ctrl+Enter to log - Esc hides and keeps the draft"
                   Foreground="#7C9B97"
                   FontSize="11"
                   TextWrapping="Wrap"
                   VerticalAlignment="Center"/>
        <Button x:Name="DiscardButton"
                Grid.Column="1"
                Content="Discard"
                Padding="12,5,12,5"
                Margin="0,0,8,0"
                Background="#233434"
                Foreground="#B9D6D1"
                BorderThickness="0"
                Cursor="Hand"/>
        <Button x:Name="LogButton"
                Grid.Column="2"
                Content="Log it"
                Padding="14,5,14,5"
                Background="#1F8C7C"
                Foreground="#F7FFFB"
                BorderThickness="0"
                Cursor="Hand"/>
      </Grid>

      <ScrollViewer x:Name="BodyScroll"
                    VerticalScrollBarVisibility="Auto"
                    HorizontalScrollBarVisibility="Disabled"
                    Padding="0,0,8,0"
                    MaxHeight="520">
        <StackPanel>
          <TextBlock Text="1. Upsetting event" Style="{StaticResource SectionHead}"/>
          <TextBlock Text="What happened? One or two lines - who, what, when." Style="{StaticResource HintText}"/>
          <TextBox x:Name="EventBox" Style="{StaticResource FieldBox}"/>

          <TextBlock Text="2. Emotions" Style="{StaticResource SectionHead}"/>
          <TextBlock Text="Score each family 0-100% for how you feel right now. Fill the After column once you have answered the thoughts below - the drop is the whole point of the log." Style="{StaticResource HintText}"/>
          <StackPanel x:Name="EmotionPanel" Margin="0,0,0,8"/>

          <TextBlock Text="3. Negative thoughts" Style="{StaticResource SectionHead}"/>
          <TextBlock Text="Write the thought, say how much you believe it, tick the distortions in it, then answer it. A positive thought only counts if it is 100% true and it cuts your belief in the negative one." Style="{StaticResource HintText}"/>
          <StackPanel x:Name="ThoughtPanel"/>
          <Button x:Name="AddThoughtButton" Content="+ Add another thought" Style="{StaticResource SoftButton}"/>

          <TextBlock Text="4. Outcome" Style="{StaticResource SectionHead}"/>
          <TextBlock Text="What changed, and what is left over?" Style="{StaticResource HintText}"/>
          <TextBox x:Name="OutcomeBox" Style="{StaticResource FieldBox}"/>
        </StackPanel>
      </ScrollViewer>
    </DockPanel>
  </Border>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

$eventBox = $window.FindName("EventBox")
$emotionPanel = $window.FindName("EmotionPanel")
$thoughtPanel = $window.FindName("ThoughtPanel")
$addThoughtButton = $window.FindName("AddThoughtButton")
$outcomeBox = $window.FindName("OutcomeBox")
$bodyScroll = $window.FindName("BodyScroll")
$statusText = $window.FindName("StatusText")
$subtitleText = $window.FindName("SubtitleText")
$logButton = $window.FindName("LogButton")
$discardButton = $window.FindName("DiscardButton")

$defaultStatus = "Ctrl+Enter to log - Esc hides and keeps the draft"

function Set-CaptureStatus {
  param([string]$Message)
  $statusText.Text = $Message
}

# --- Form construction -------------------------------------------------------
# The emotion table and the thought cards are built in code rather than XAML:
# nine emotion rows and three near-identical thought cards written out by hand
# would be several hundred lines of markup that has to be edited in eleven
# places to change one label. All the colour lives in the styles above, so the
# builders only ever set Style plus content.

function New-PercentBox {
  $box = New-Object System.Windows.Controls.TextBox
  $box.Style = $window.FindResource("PctBox")
  # Digits only. MaxLength caps typing at three; a paste is cleaned up when the
  # value is read, so nothing here can reject a keystroke the user meant.
  $box.Add_PreviewTextInput({
    param($sender, $textEvent)
    if ($textEvent.Text -notmatch '^[0-9]+$') { $textEvent.Handled = $true }
  })
  return $box
}

function New-GridColumn {
  param($Grid, [double]$Width)
  $column = New-Object System.Windows.Controls.ColumnDefinition
  if ($Width -gt 0) {
    $column.Width = New-Object System.Windows.GridLength $Width
  } else {
    $column.Width = New-Object System.Windows.GridLength 1, ([System.Windows.GridUnitType]::Star)
  }
  $Grid.ColumnDefinitions.Add($column)
}

# One three-column grid per row - label, Now, After - with the two percentage
# columns at a fixed width so every row and the header line up without a shared
# size scope.
function New-EmotionGrid {
  $grid = New-Object System.Windows.Controls.Grid
  New-GridColumn -Grid $grid -Width 0
  New-GridColumn -Grid $grid -Width 62
  New-GridColumn -Grid $grid -Width 62
  return $grid
}

function Add-EmotionHeader {
  $grid = New-EmotionGrid
  $spacer = New-Object System.Windows.Controls.TextBlock
  $spacer.Style = $window.FindResource("ColHead")
  $spacer.Text = "Emotion"
  $spacer.TextAlignment = [System.Windows.TextAlignment]::Left
  [System.Windows.Controls.Grid]::SetColumn($spacer, 0)
  $now = New-Object System.Windows.Controls.TextBlock
  $now.Style = $window.FindResource("ColHead")
  $now.Text = "Now %"
  [System.Windows.Controls.Grid]::SetColumn($now, 1)
  $after = New-Object System.Windows.Controls.TextBlock
  $after.Style = $window.FindResource("ColHead")
  $after.Text = "After %"
  [System.Windows.Controls.Grid]::SetColumn($after, 2)
  $grid.Children.Add($spacer) | Out-Null
  $grid.Children.Add($now) | Out-Null
  $grid.Children.Add($after) | Out-Null
  $emotionPanel.Children.Add($grid) | Out-Null
}

function Add-EmotionRow {
  param([string]$Label, [switch]$Editable)
  $grid = New-EmotionGrid
  if ($Editable) {
    # A bare box in the label column reads as a stray field, so the row carries
    # its own "Other:" caption and the box only takes the width a feeling needs.
    $otherRow = New-Object System.Windows.Controls.StackPanel
    $otherRow.Orientation = [System.Windows.Controls.Orientation]::Horizontal
    $otherCaption = New-Object System.Windows.Controls.TextBlock
    $otherCaption.Style = $window.FindResource("EmotionLabel")
    $otherCaption.Text = "Other:"
    $otherCaption.Margin = New-Object System.Windows.Thickness 0, 0, 8, 4
    $labelBox = New-Object System.Windows.Controls.TextBox
    $labelBox.Style = $window.FindResource("OtherBox")
    $labelBox.Width = 260
    $labelBox.ToolTip = "Any feeling the nine families above do not cover - name it here."
    $otherRow.Children.Add($otherCaption) | Out-Null
    $otherRow.Children.Add($labelBox) | Out-Null
    [System.Windows.Controls.Grid]::SetColumn($otherRow, 0)
    $grid.Children.Add($otherRow) | Out-Null
  } else {
    $labelBox = $null
    $labelText = New-Object System.Windows.Controls.TextBlock
    $labelText.Style = $window.FindResource("EmotionLabel")
    $labelText.Text = $Label
    [System.Windows.Controls.Grid]::SetColumn($labelText, 0)
    $grid.Children.Add($labelText) | Out-Null
  }
  $before = New-PercentBox
  [System.Windows.Controls.Grid]::SetColumn($before, 1)
  $after = New-PercentBox
  [System.Windows.Controls.Grid]::SetColumn($after, 2)
  $grid.Children.Add($before) | Out-Null
  $grid.Children.Add($after) | Out-Null
  $emotionPanel.Children.Add($grid) | Out-Null
  $script:emotionRows.Add(@{
    Label = $Label
    LabelBox = $labelBox
    Before = $before
    After = $after
  })
}

function New-DistortionChips {
  param($Panel)
  $chips = New-Object System.Collections.Generic.List[object]
  foreach ($distortion in $script:distortions) {
    $chip = New-Object System.Windows.Controls.Primitives.ToggleButton
    $chip.Style = $window.FindResource("ChipToggle")
    $chip.Content = $distortion.Short
    # Tag carries the full name because that is what the journal gets: chips are
    # abbreviated to fit, records are not.
    $chip.Tag = $distortion.Full
    $tip = New-Object System.Windows.Controls.TextBlock
    $tip.Text = $distortion.Hint
    $tip.TextWrapping = [System.Windows.TextWrapping]::Wrap
    $tip.MaxWidth = 320
    $chip.ToolTip = $tip
    $Panel.Children.Add($chip) | Out-Null
    $chips.Add($chip)
  }
  # The comma stops PowerShell unrolling the list into the pipeline.
  return ,$chips
}

function Add-ThoughtCard {
  param([int]$Index)
  $card = New-Object System.Windows.Controls.Border
  $card.Style = $window.FindResource("ThoughtCard")
  $stack = New-Object System.Windows.Controls.StackPanel
  $card.Child = $stack

  $heading = New-Object System.Windows.Controls.TextBlock
  $heading.Style = $window.FindResource("FieldLabel")
  $heading.Text = "Negative thought $Index - what went through your head?"
  $stack.Children.Add($heading) | Out-Null

  $thoughtBox = New-Object System.Windows.Controls.TextBox
  $thoughtBox.Style = $window.FindResource("FieldBox")
  $stack.Children.Add($thoughtBox) | Out-Null

  $beliefRow = New-Object System.Windows.Controls.StackPanel
  $beliefRow.Orientation = [System.Windows.Controls.Orientation]::Horizontal
  $beliefRow.Margin = New-Object System.Windows.Thickness 0, 0, 0, 8
  $beliefLabel = New-Object System.Windows.Controls.TextBlock
  $beliefLabel.Style = $window.FindResource("EmotionLabel")
  $beliefLabel.Text = "How much do you believe it? Now %"
  $beliefLabel.Margin = New-Object System.Windows.Thickness 0, 0, 8, 0
  $beliefBefore = New-PercentBox
  $beliefBefore.Margin = New-Object System.Windows.Thickness 0, 0, 14, 0
  $afterLabel = New-Object System.Windows.Controls.TextBlock
  $afterLabel.Style = $window.FindResource("EmotionLabel")
  $afterLabel.Text = "After %"
  $afterLabel.Margin = New-Object System.Windows.Thickness 0, 0, 8, 0
  $beliefAfter = New-PercentBox
  $beliefRow.Children.Add($beliefLabel) | Out-Null
  $beliefRow.Children.Add($beliefBefore) | Out-Null
  $beliefRow.Children.Add($afterLabel) | Out-Null
  $beliefRow.Children.Add($beliefAfter) | Out-Null
  $stack.Children.Add($beliefRow) | Out-Null

  $distortionLabel = New-Object System.Windows.Controls.TextBlock
  $distortionLabel.Style = $window.FindResource("FieldLabel")
  $distortionLabel.Text = "Distortions in it (hover for the definition)"
  $stack.Children.Add($distortionLabel) | Out-Null

  $chipPanel = New-Object System.Windows.Controls.WrapPanel
  $chipPanel.Margin = New-Object System.Windows.Thickness 0, 0, 0, 6
  $stack.Children.Add($chipPanel) | Out-Null
  $chips = New-DistortionChips -Panel $chipPanel

  $positiveLabel = New-Object System.Windows.Controls.TextBlock
  $positiveLabel.Style = $window.FindResource("FieldLabel")
  $positiveLabel.Text = "Positive thought - 100% true, and it has to cut the belief above"
  $stack.Children.Add($positiveLabel) | Out-Null

  $positiveBox = New-Object System.Windows.Controls.TextBox
  $positiveBox.Style = $window.FindResource("FieldBox")
  $stack.Children.Add($positiveBox) | Out-Null

  $positiveRow = New-Object System.Windows.Controls.StackPanel
  $positiveRow.Orientation = [System.Windows.Controls.Orientation]::Horizontal
  $positiveLabelText = New-Object System.Windows.Controls.TextBlock
  $positiveLabelText.Style = $window.FindResource("EmotionLabel")
  $positiveLabelText.Text = "How much do you believe the positive thought? %"
  $positiveLabelText.Margin = New-Object System.Windows.Thickness 0, 0, 8, 0
  $positiveBelief = New-PercentBox
  $positiveRow.Children.Add($positiveLabelText) | Out-Null
  $positiveRow.Children.Add($positiveBelief) | Out-Null
  $stack.Children.Add($positiveRow) | Out-Null

  # Cards two and three start hidden. The book wants every negative thought on
  # the page, but an empty three-card wall is the kind of thing that gets the
  # window closed again, so the extras are one click away instead.
  if ($Index -gt 1) { $card.Visibility = [System.Windows.Visibility]::Collapsed }
  $thoughtPanel.Children.Add($card) | Out-Null

  $script:thoughtBlocks.Add(@{
    Card = $card
    Thought = $thoughtBox
    BeliefBefore = $beliefBefore
    BeliefAfter = $beliefAfter
    Chips = $chips
    Positive = $positiveBox
    PositiveBelief = $positiveBelief
  })
}

$script:emotionRows = New-Object System.Collections.Generic.List[object]
$script:thoughtBlocks = New-Object System.Collections.Generic.List[object]

Add-EmotionHeader
foreach ($group in $script:emotionGroups) {
  Add-EmotionRow -Label $group
}
Add-EmotionRow -Label "Other" -Editable

for ($i = 1; $i -le 3; $i++) {
  Add-ThoughtCard -Index $i
}

function Show-NextThoughtCard {
  foreach ($block in $script:thoughtBlocks) {
    if ($block.Card.Visibility -ne [System.Windows.Visibility]::Visible) {
      $block.Card.Visibility = [System.Windows.Visibility]::Visible
      $block.Thought.Focus()
      break
    }
  }
  Update-AddThoughtButton
}

function Update-AddThoughtButton {
  $hidden = 0
  foreach ($block in $script:thoughtBlocks) {
    if ($block.Card.Visibility -ne [System.Windows.Visibility]::Visible) { $hidden++ }
  }
  if ($hidden -gt 0) {
    $addThoughtButton.Visibility = [System.Windows.Visibility]::Visible
  } else {
    $addThoughtButton.Visibility = [System.Windows.Visibility]::Collapsed
  }
}

$addThoughtButton.Add_Click({ Show-NextThoughtCard })

# --- Reading the form --------------------------------------------------------

# Returns 0-100 or $null. Anything unparseable reads as blank rather than as a
# zero: "not rated" and "rated zero" are different answers in a mood log.
function Get-PercentValue {
  param($Box)
  $raw = ([string]$Box.Text).Trim()
  if (-not $raw) { return $null }
  $digits = ($raw -replace '[^0-9]', '')
  if (-not $digits) { return $null }
  if ($digits.Length -gt 3) { $digits = $digits.Substring(0, 3) }
  $value = [int]$digits
  if ($value -gt 100) { $value = 100 }
  return $value
}

function Get-CheckedDistortions {
  param($Chips)
  $names = New-Object System.Collections.Generic.List[string]
  foreach ($chip in $Chips) {
    if ($chip.IsChecked -eq $true) { $names.Add([string]$chip.Tag) }
  }
  return ,$names
}

function Test-DraftEmpty {
  if ($eventBox.Text.Trim()) { return $false }
  if ($outcomeBox.Text.Trim()) { return $false }
  foreach ($row in $script:emotionRows) {
    if ($null -ne (Get-PercentValue $row.Before)) { return $false }
    if ($null -ne (Get-PercentValue $row.After)) { return $false }
    if ($row.LabelBox -and $row.LabelBox.Text.Trim()) { return $false }
  }
  foreach ($block in $script:thoughtBlocks) {
    if ($block.Thought.Text.Trim()) { return $false }
    if ($block.Positive.Text.Trim()) { return $false }
    if ($null -ne (Get-PercentValue $block.BeliefBefore)) { return $false }
    if ($null -ne (Get-PercentValue $block.BeliefAfter)) { return $false }
    if ($null -ne (Get-PercentValue $block.PositiveBelief)) { return $false }
    if ((Get-CheckedDistortions $block.Chips).Count -gt 0) { return $false }
  }
  return $true
}

function Clear-Draft {
  $eventBox.Text = ""
  $outcomeBox.Text = ""
  foreach ($row in $script:emotionRows) {
    $row.Before.Text = ""
    $row.After.Text = ""
    if ($row.LabelBox) { $row.LabelBox.Text = "" }
  }
  $index = 0
  foreach ($block in $script:thoughtBlocks) {
    $index++
    $block.Thought.Text = ""
    $block.Positive.Text = ""
    $block.BeliefBefore.Text = ""
    $block.BeliefAfter.Text = ""
    $block.PositiveBelief.Text = ""
    foreach ($chip in $block.Chips) { $chip.IsChecked = $false }
    if ($index -gt 1) { $block.Card.Visibility = [System.Windows.Visibility]::Collapsed }
  }
  Update-AddThoughtButton
  $bodyScroll.ScrollToTop()
  $script:sessionStart = $null
}

# One line per rated emotion. A family nobody scored is left out entirely
# rather than written as a blank, so the record reads as what was felt.
function Get-EmotionLines {
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($row in $script:emotionRows) {
    $label = [string]$row.Label
    if ($row.LabelBox) { $label = ([string]$row.LabelBox.Text).Trim() }
    $before = Get-PercentValue $row.Before
    $after = Get-PercentValue $row.After
    if ($null -eq $before -and $null -eq $after) { continue }
    if (-not $label) { $label = "Other" }
    if ($null -ne $before -and $null -ne $after) {
      $lines.Add($label + ": " + $before + "% -> " + $after + "%")
    } elseif ($null -ne $before) {
      $lines.Add($label + ": " + $before + "%")
    } else {
      $lines.Add($label + ": after " + $after + "%")
    }
  }
  return ,$lines
}

# One paragraph per thought that has anything in it, so the journal shows the
# thought, its belief ratings, its distortions and its answer as a single block
# instead of scattering them.
function Get-ThoughtParagraphs {
  $filled = New-Object System.Collections.Generic.List[object]
  foreach ($block in $script:thoughtBlocks) {
    $hasText = $block.Thought.Text.Trim() -or $block.Positive.Text.Trim()
    if ($hasText) { $filled.Add($block) }
  }
  $paragraphs = New-Object System.Collections.Generic.List[string]
  $number = 0
  foreach ($block in $filled) {
    $number++
    $heading = "Negative thought"
    if ($filled.Count -gt 1) { $heading = "Negative thought $number" }
    $lines = New-Object System.Collections.Generic.List[string]
    $thought = $block.Thought.Text.Trim()
    if ($thought) { $lines.Add($heading + ": " + $thought) }
    $before = Get-PercentValue $block.BeliefBefore
    $after = Get-PercentValue $block.BeliefAfter
    if ($null -ne $before -and $null -ne $after) {
      $lines.Add("Believed " + $before + "% -> " + $after + "%")
    } elseif ($null -ne $before) {
      $lines.Add("Believed " + $before + "%")
    } elseif ($null -ne $after) {
      $lines.Add("Believed afterwards " + $after + "%")
    }
    $names = Get-CheckedDistortions $block.Chips
    if ($names.Count -gt 0) { $lines.Add("Distortions: " + ($names -join ", ")) }
    $positive = $block.Positive.Text.Trim()
    if ($positive) {
      $positiveBelief = Get-PercentValue $block.PositiveBelief
      if ($null -ne $positiveBelief) {
        $lines.Add("Positive thought: " + $positive + " (believed " + $positiveBelief + "%)")
      } else {
        $lines.Add("Positive thought: " + $positive)
      }
    }
    $paragraphs.Add($lines -join "`n")
  }
  return ,$paragraphs
}

# --- Window plumbing ---------------------------------------------------------

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

function Get-CaptureScreen {
  try {
    $cursor = [System.Windows.Forms.Cursor]::Position
    return [System.Windows.Forms.Screen]::FromPoint($cursor)
  } catch {
    return [System.Windows.Forms.Screen]::PrimaryScreen
  }
}

# The mood log is far taller than the old six-box form, so the scrolling body
# gets whatever the monitor can spare rather than a fixed height: on a laptop at
# 150% scaling the same content that fits a desktop screen has to scroll.
function Set-BodyHeight {
  $scale = Get-DeviceToDipScale
  $screen = Get-CaptureScreen
  $available = ($screen.WorkingArea.Height / $scale) - 190
  if ($available -lt 260) { $available = 260 }
  $bodyScroll.MaxHeight = [Math]::Round($available)
}

# Open on whichever monitor the pointer is on, a little above centre so the
# window does not sit on top of whatever set the thought off.
function Set-CaptureWindowPosition {
  $scale = Get-DeviceToDipScale
  $screen = Get-CaptureScreen
  $area = $screen.WorkingArea
  $left = ($area.Left / $scale) + ((($area.Width / $scale) - $window.Width) / 2)
  $height = $window.ActualHeight
  if ($height -le 0) { $height = 700 }
  $top = ($area.Top / $scale) + ((($area.Height / $scale) - $height) / 3)
  $window.Left = [Math]::Round($left)
  $window.Top = [Math]::Round([Math]::Max($top, ($area.Top / $scale) + 20))
}

function Show-CaptureWindow {
  $script:previousWindow = [CbtHotkeyListener]::GetForegroundWindow()
  # A fresh session (empty draft) starts its clock now; a re-shown draft keeps
  # the clock it started with, same contract as the quick journal window.
  if ((Test-DraftEmpty) -or (-not $script:sessionStart)) {
    $script:sessionStart = Get-Date
  }
  Set-CaptureStatus (Format-CaptureStatusWithOutbox $defaultStatus)
  $subtitleText.Text = "Filing under " + (Get-Date -Format "dddd, MMMM d") + ". Only the event and the first thought are needed."
  Set-BodyHeight
  Set-CaptureWindowPosition
  $window.Show()
  Set-CaptureWindowPosition
  $window.Activate()
  try {
    $handle = (New-Object System.Windows.Interop.WindowInteropHelper($window)).Handle
    [CbtHotkeyListener]::HideFromAltTab($handle)
    [void][CbtHotkeyListener]::SetForegroundWindow($handle)
  } catch {
    # Activation is best effort; the window is still usable with the mouse.
  }
  $eventBox.Focus()
  $eventBox.CaretIndex = $eventBox.Text.Length
}

# Hiding never clears the boxes, so an accidental Esc cannot lose typing. Only a
# successful log or the Discard button resets them.
function Hide-CaptureWindow {
  $window.Hide()
  if ($script:previousWindow -ne [IntPtr]::Zero) {
    [void][CbtHotkeyListener]::SetForegroundWindow($script:previousWindow)
    $script:previousWindow = [IntPtr]::Zero
  }
}

function Submit-ThoughtRecord {
  $upsettingEvent = $eventBox.Text.Trim()
  $firstThought = $script:thoughtBlocks[0].Thought.Text.Trim()
  if (-not $upsettingEvent) {
    Set-CaptureStatus "Write the upsetting event first."
    $eventBox.Focus()
    return
  }
  if (-not $firstThought) {
    Set-CaptureStatus "Write the negative thought - that is the thing being examined."
    $script:thoughtBlocks[0].Card.Visibility = [System.Windows.Visibility]::Visible
    $script:thoughtBlocks[0].Thought.Focus()
    return
  }

  if (-not $script:sessionStart) { $script:sessionStart = Get-Date }
  $endedAt = Get-Date

  # Labelled paragraphs, blank-line separated so /api/quick-journal renders one
  # paragraph per answered section. Single newlines inside a paragraph become
  # <br>, which is what keeps the emotion table and each thought together as
  # blocks. Empty sections are left out rather than sent as bare labels.
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("Upsetting event: " + $upsettingEvent)
  $emotionLines = Get-EmotionLines
  if ($emotionLines.Count -gt 0) {
    $lines.Add("Emotions (now -> after):`n" + ($emotionLines -join "`n"))
  }
  foreach ($paragraph in (Get-ThoughtParagraphs)) {
    $lines.Add($paragraph)
  }
  if ($outcomeBox.Text.Trim()) { $lines.Add("Outcome: " + $outcomeBox.Text.Trim()) }

  $payload = @{
    # The local day the record was started, not submitted: a record begun at
    # 23:55 belongs to the day that produced the thought.
    date = $script:sessionStart.ToString("yyyy-MM-dd")
    title = "Thought record"
    text = ($lines -join "`n`n")
    startedAt = $script:sessionStart.ToUniversalTime().ToString("o")
    endedAt = $endedAt.ToUniversalTime().ToString("o")
  }

  $result = Invoke-CapturePost -BaseUrl $baseUrl -Endpoint "/api/quick-journal" -Payload $payload

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

  Clear-Draft
  if ($result.status -eq "queued") {
    Set-CaptureStatus $captureQueuedStatus
    Start-CaptureNoticeHide -Hide { Hide-CaptureWindow }
    return
  }
  Hide-CaptureWindow
}

$logButton.Add_Click({ Submit-ThoughtRecord })
$discardButton.Add_Click({
  Clear-Draft
  Set-CaptureStatus $defaultStatus
  Hide-CaptureWindow
})

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
    Submit-ThoughtRecord
  }
})

# Deliberately no hide-on-deactivate. If the foreground grab loses a race the
# window would vanish the instant it appeared and the hotkey would look dead.
$window.Add_Closing({
  param($sender, $closeEvent)
  $closeEvent.Cancel = $true
  Hide-CaptureWindow
})

$listener = New-Object CbtHotkeyListener
$listener.add_HotKeyPressed({
  if ($window.IsVisible) {
    $window.Activate()
    $eventBox.Focus()
  } else {
    Show-CaptureWindow
  }
})

# Ctrl+Alt+C first, then fallbacks, mirroring the eye-rest listener. None of
# these collide with the combos the other listeners try (Q/J/U, W, E/R/Y,
# L/B/N). MOD_ALT 0x1 | MOD_CONTROL 0x2 | MOD_SHIFT 0x4 | MOD_NOREPEAT 0x4000.
$hotkeyAttempts = @(
  @{ Modifiers = 0x4003; Key = 0x43; Label = "Ctrl+Alt+C" },
  @{ Modifiers = 0x4007; Key = 0x43; Label = "Ctrl+Shift+Alt+C" },
  @{ Modifiers = 0x4003; Key = 0x47; Label = "Ctrl+Alt+G" },
  @{ Modifiers = 0x4003; Key = 0x4B; Label = "Ctrl+Alt+K" }
)

$registeredLabel = $null
foreach ($attempt in $hotkeyAttempts) {
  if ($listener.Register(0xCB7, $attempt.Modifiers, $attempt.Key)) {
    $registeredLabel = $attempt.Label
    break
  }
}

if (-not $registeredLabel) {
  [System.Windows.MessageBox]::Show(
    "Every thought-record hotkey (Ctrl+Alt+C and its fallbacks) is already taken by another program, so the window cannot open. Close whatever owns them, or edit the list in cbt-capture.ps1.",
    "Event Horizon") | Out-Null
  $listener.Dispose()
  exit
}

if ($registeredLabel -ne "Ctrl+Alt+C") {
  [System.Windows.MessageBox]::Show(
    "Ctrl+Alt+C was taken, so the thought-record window registered $registeredLabel instead.",
    "Event Horizon") | Out-Null
}

try {
  [System.Windows.Threading.Dispatcher]::Run()
} finally {
  $listener.Dispose()
  $script:instanceMutex.ReleaseMutex()
  $script:instanceMutex.Dispose()
}
