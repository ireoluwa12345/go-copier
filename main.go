package main

import (
	"fmt"
	"os"

	"github.com/ireoluwa12345/go-copier/pkg/crawler"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go-copier <url>")
		return
	}

	url := os.Args[1]
	foundChan := make(chan string, 1000)

	crawler := crawler.NewCrawler(url, foundChan)
	// rewriter := rewriter.NewRewriter()

	go crawler.Crawl()
	// go rewriter.Rewrite(foundChan)

	select {}
}
