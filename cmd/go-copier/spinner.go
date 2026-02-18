package main

import (
	"fmt"

	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/ireoluwa12345/go-copier/internal/rewriter"
)

type spinnerModel struct {
	spinner   spinner.Model
	url       string
	outputDir string
	progress  *rewriter.Progress
	quitting  bool
	completed bool
	err       error
}

func initialSpinnerModel(url, outputDir string) spinnerModel {
	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
	return spinnerModel{
		spinner:   s,
		url:       url,
		outputDir: outputDir,
		progress:  &rewriter.Progress{},
	}
}

func (m spinnerModel) Init() tea.Cmd {
	return m.spinner.Tick
}

func (m spinnerModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "esc", "ctrl+c":
			m.quitting = true
			return m, tea.Quit
		default:
			return m, nil
		}

	case progressMsg:
		m.progress = msg.progress
		if m.progress.IsComplete {
			m.completed = true
			return m, tea.Quit
		}
		return m, nil

	case errMsg:
		m.err = msg
		return m, nil

	default:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	}
}

func (m spinnerModel) View() string {
	if m.err != nil {
		return m.err.Error()
	}

	view := fmt.Sprintf("\n\n   %s Copying %s\n\n", m.spinner.View(), m.url)

	if m.completed {
		view = fmt.Sprintf("\n\n   %s Done! Saved to %s\n\n", "✓", m.outputDir)
		view += fmt.Sprintf("   URLs found: %d\n", m.progress.URLsFound)
		view += fmt.Sprintf("   URLs copied: %d\n", m.progress.URLsDone)
	} else if m.progress.URLsFound > 0 || m.progress.URLsDone > 0 {
		view += fmt.Sprintf("   URLs found: %d\n", m.progress.URLsFound)
		view += fmt.Sprintf("   URLs copied: %d\n", m.progress.URLsDone)
	}

	if m.quitting {
		view += "\n"
	}
	return view
}

type progressMsg struct {
	progress *rewriter.Progress
}
