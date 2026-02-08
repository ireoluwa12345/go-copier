package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/ireoluwa12345/go-copier/pkg/crawler"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go-copier <url>")
		return
	}

	url := os.Args[1]

	// Create output directory based on domain
	domain := strings.ReplaceAll(url, "https://", "")
	domain = strings.ReplaceAll(domain, "http://", "")
	domain = strings.Split(domain, "/")[0]
	outputDir := filepath.Join("output", domain)

	foundChan := make(chan string, 1000)

	crawler := crawler.NewCrawler(url, foundChan)

	var wg sync.WaitGroup

	// Start crawler
	wg.Add(1)
	go func() {
		defer wg.Done()
		crawler.Crawl()
	}()

	// Wait for both to complete
	wg.Wait()

	// Print summary
	fmt.Printf("\n=== Crawling Complete ===\n")
	fmt.Printf("Output saved to: %s\n", outputDir)
}
