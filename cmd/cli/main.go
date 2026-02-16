package main

import (
	"log"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/ireoluwa12345/go-copier/internal/copier"
	"github.com/ireoluwa12345/go-copier/internal/rewriter"
	"github.com/spf13/cobra"
)

var rootCommand = &cobra.Command{
	Use:   "go-copier",
	Short: "A tool to copy websites",
	Run: func(cmd *cobra.Command, args []string) {
		url, _ := cmd.Flags().GetString("url")
		outputDir, _ := cmd.Flags().GetString("output")
		maxDepth, _ := cmd.Flags().GetInt("max-depth")
		var err error

		if url == "" && outputDir == "" {
			url, outputDir, err = runInteractive()

			if err != nil {
				if err == ErrCancelled {
					os.Exit(0)
				}
				log.Fatal(err)
			}
		} else if url == "" {
			log.Fatalf("URL is required")
		} else if outputDir == "" {
			log.Fatalf("Output directory is required")
		}

		p := tea.NewProgram(initialSpinnerModel(url, outputDir))
		go func() {
			copier.Copy(url, outputDir, maxDepth, func(progress *rewriter.Progress) {
				p.Send(progressMsg{progress: progress})
			})
		}()
		p.Run()
	},
}

func init() {
	rootCommand.Flags().StringP("url", "u", "", "URL to download")
	rootCommand.Flags().StringP("output", "o", "", "Output directory")
	rootCommand.Flags().IntP("max-depth", "d", 2, "Maximum crawl depth")
}

func Execute() {
	if err := rootCommand.Execute(); err != nil {
		os.Exit(1)
	}
}

func main() {
	Execute()
}
