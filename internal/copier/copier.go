package copier

import (
	"path/filepath"
	"strings"
	"sync"

	"github.com/ireoluwa12345/go-copier/internal/crawler"
	"github.com/ireoluwa12345/go-copier/internal/rewriter"
)

func Copy(url string, outputDir string, maxDepth int, onProgress func(*rewriter.Progress)) bool {
	domain := strings.ReplaceAll(url, "https://", "")
	domain = strings.ReplaceAll(domain, "http://", "")
	domain = strings.Split(domain, "/")[0]
	outputDir = filepath.Join(outputDir, domain)

	foundChan := make(chan string, 1000)
	progress := &rewriter.Progress{}

	crawler := crawler.NewCrawler(url, foundChan, maxDepth)
	rewriter := rewriter.NewRewriter(foundChan, outputDir, progress)

	var wg sync.WaitGroup

	wg.Add(2)
	go func() {
		defer wg.Done()
		crawler.Crawl()
	}()

	go func() {
		defer wg.Done()
		rewriter.Rewrite()
		progress.IsComplete = true
		if onProgress != nil {
			onProgress(progress)
		}
	}()

	if onProgress != nil {
		go func() {
			for {
				if progress.IsComplete {
					break
				}
				onProgress(progress)
			}
		}()
	}

	wg.Wait()

	if onProgress != nil {
		onProgress(progress)
	}

	return true
}
