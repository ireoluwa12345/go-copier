package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/charmbracelet/bubbles/filepicker"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type (
	errMsg error
)

var style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

type step int

const (
	stepURL step = iota
	stepDirPicker
	stepNewDir
	stepFinished
)

type model struct {
	step        step
	filepicker  filepicker.Model
	textInput   textinput.Model
	url         string
	selectedDir string
	newDirName  string
	creatingDir bool
	cancelled   bool
	err         error
}

func initialModel() model {
	homeDir, _ := os.UserHomeDir()

	ti := textinput.New()
	ti.Placeholder = "Enter website URL"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 40

	newDirTi := textinput.New()
	newDirTi.Placeholder = "Enter new directory name"
	newDirTi.Focus()
	newDirTi.CharLimit = 100
	newDirTi.Width = 60

	fp := filepicker.New()
	fp.CurrentDirectory = homeDir
	fp.AllowedTypes = []string{}
	fp.DirAllowed = true
	fp.Height = 10

	return model{
		step:        stepURL,
		textInput:   ti,
		filepicker:  fp,
		newDirName:  "",
		creatingDir: false,
		err:         nil,
	}
}

func (m model) Init() tea.Cmd {
	if m.step == stepDirPicker || m.step == stepNewDir {
		return m.filepicker.Init()
	}
	return textinput.Blink
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			if m.step == stepNewDir {
				m.step = stepDirPicker
				m.creatingDir = false
				return m, nil
			}
			m.cancelled = true
			return m, tea.Quit
		case tea.KeyEnter:
			if m.step == stepURL {
				m.url = m.textInput.Value()
				if m.url == "" {
					return m, nil
				}
				m.step = stepDirPicker
				return m, m.filepicker.Init()
			}
			if m.step == stepNewDir {
				newDirPath := m.filepicker.CurrentDirectory + "/" + m.newDirName
				if err := os.MkdirAll(newDirPath, 0755); err != nil {
					m.err = err
					return m, nil
				}
				m.selectedDir = newDirPath
				return m, tea.Quit
			}
			if m.step == stepDirPicker {
				if m.filepicker.Path != "" {
					selectedPath := m.filepicker.Path
					info, err := os.Stat(selectedPath)
					if err != nil {
						return m, nil
					}
					if info.IsDir() {
						m.filepicker.CurrentDirectory = selectedPath
						m.filepicker.Path = ""
						return m, m.filepicker.Init()
					}
					m.selectedDir = selectedPath
					return m, tea.Quit
				}
			}
		case tea.KeyCtrlR:
			if m.step == stepDirPicker && m.filepicker.CurrentDirectory != "" {
				m.selectedDir = m.filepicker.CurrentDirectory
				m.step = stepFinished
				return m, tea.Quit
			}
		case tea.KeyCtrlN:
			if m.step == stepDirPicker {
				m.step = stepNewDir
				m.creatingDir = true
				m.newDirName = ""
				ti := textinput.New()
				ti.Placeholder = "Enter new directory name"
				ti.Focus()
				ti.CharLimit = 100
				ti.Width = 40
				m.textInput = ti
				return m, nil
			}
		}

		if m.step == stepDirPicker {
			if msg.String() == "b" && m.filepicker.CurrentDirectory != "" {
				m.filepicker.CurrentDirectory = filepath.Dir(m.filepicker.CurrentDirectory)
				m.filepicker.Path = ""
				return m, m.filepicker.Init()
			}
		}

	case errMsg:
		m.err = msg
		return m, nil
	}

	if m.step == stepURL {
		m.textInput, cmd = m.textInput.Update(msg)
	} else if m.step == stepNewDir {
		m.textInput, cmd = m.textInput.Update(msg)
		m.newDirName = m.textInput.Value()
	} else {
		m.filepicker, cmd = m.filepicker.Update(msg)
	}
	return m, cmd
}

func (m model) View() string {
	if m.step == stepURL {
		return fmt.Sprintf(
			"Enter website URL to download:\n\n%s\n\n%s",
			style.Render(m.textInput.View()),
			"(press Enter to continue, esc to quit)",
		) + "\n"
	}

	if m.step == stepNewDir {
		return fmt.Sprintf(
			"Create new directory in %s:\n\n%s\n\n%s",
			m.filepicker.CurrentDirectory,
			style.Render(m.textInput.View()),
			"(press Enter to create, esc to cancel)",
		) + "\n"
	}

	if m.step == stepDirPicker {
		currentURL := m.url
		if currentURL == "" {
			currentURL = "your website"
		}

		return fmt.Sprintf(
			"Select output directory for %s:\n\n%s\n\n%s",
			currentURL,
			m.filepicker.View(),
			"(arrow keys to navigate, Enter to enter dir, b back, Ctrl+R select dir, Ctrl+N new dir, Esc quit)",
		) + "\n"
	}

	return ""

}

var ErrCancelled = errors.New("operation cancelled")

func runInteractive() (string, string, error) {
	program := tea.NewProgram(initialModel())
	result, err := program.Run()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	if m, ok := result.(model); ok {
		if m.cancelled {
			return "", "", ErrCancelled
		}
		return m.url, m.selectedDir, nil
	}
	return "", "", errors.New("unknown error")
}
