# Go Copier

A blazing-fast CLI tool built in Go for downloading and mirroring websites locally. Features an interactive TUI, concurrent crawling, and intelligent asset rewriting.

## Features

- **Interactive TUI** - Beautiful terminal interface powered by [Bubble Tea](https://github.com/charmbracelet/bubbletea)
- **Concurrent Crawling** - Fast parallel downloads with sync.WaitGroup coordination
- **Smart Asset Handling** - Automatically rewrites CSS URLs and localizes all resources
- **Real-time Progress** - Live download progress with visual feedback
- **Flexible Interface** - Use interactive mode or CLI flags

## Installation

```bash
# Clone the repository
git clone https://github.com/ireoluwa12345/go-copier.git
cd go-copier

# Build the binary
make build-cli

# Or build and run directly
make cli
```

## Usage

### Interactive Mode

Run without flags to launch the interactive TUI:

```bash
./go-copier
```

### CLI Mode

```bash
./go-copier --url https://example.com --output ./downloads

# Or use short flags
./go-copier -u https://example.com -o ./downloads
```

## Project Structure

```
go-copier/
├── cmd/cli/              # CLI entry point
│   ├── main.go          # Command handling
│   ├── tui.go           # Interactive prompts
│   └── spinner.go       # Progress UI
├── internal/
│   ├── copier/          # Main orchestration
│   ├── crawler/         # Web crawling logic
│   └── rewriter/        # Asset rewriting & download
├── pkg/css/urlextractor/ # CSS URL parsing
└── Makefile             # Build automation
```

## How It Works

1. **Crawl** - Discovers all linked pages and assets recursively
2. **Rewrite** - Modifies HTML/CSS to use local paths
3. **Download** - Concurrently fetches all resources
4. **Organize** - Saves files in a structured directory by domain

## Dependencies

- [Cobra](https://github.com/spf13/cobra) - CLI framework
- [Bubble Tea](https://github.com/charmbracelet/bubbletea) - TUI framework
- [Lipgloss](https://github.com/charmbracelet/lipgloss) - Terminal styling
- [golang.org/x/net](https://golang.org/x/net) - HTML parsing

---

Built with Go and terminal magic.
