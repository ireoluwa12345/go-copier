package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/ireoluwa12345/go-copier/internal/crawler"
	"github.com/ireoluwa12345/go-copier/internal/rewriter"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go-copier <url>")
		return
	}

	url := os.Args[1]

	domain := strings.ReplaceAll(url, "https://", "")
	domain = strings.ReplaceAll(domain, "http://", "")
	domain = strings.Split(domain, "/")[0]
	outputDir := filepath.Join("output", domain)

	foundChan := make(chan string, 1000)

	crawler := crawler.NewCrawler(url, foundChan)
	rewriter := rewriter.NewRewriter(foundChan, outputDir)

	var wg sync.WaitGroup

	wg.Add(2)
	go func() {
		defer wg.Done()
		crawler.Crawl()
	}()
	go func() {
		defer wg.Done()
		rewriter.Rewrite()
	}()

	wg.Wait()
	fmt.Println("Copying completed successfully.")
}
