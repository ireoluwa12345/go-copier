package copier

import (
	"path/filepath"
	"strings"
	"sync"

	"github.com/ireoluwa12345/go-copier/internal/crawler"
	"github.com/ireoluwa12345/go-copier/internal/rewriter"
	"golang.org/x/time/rate"
)

func Copy(url string, outputDir string, maxDepth int, onProgress func(*rewriter.Progress)) bool {

	const ratesPerSecond = 10
	const burstSize = 50

	domain := strings.ReplaceAll(url, "https://", "")
	domain = strings.ReplaceAll(domain, "http://", "")
	domain = strings.Split(domain, "/")[0]
	outputDir = filepath.Join(outputDir, domain)

	foundChan := make(chan string, 1000)
	done := make(chan struct{})
	progress := &rewriter.Progress{}

	rateLimiter := rate.NewLimiter(rate.Limit(ratesPerSecond), burstSize)

	crawler := crawler.NewCrawler(url, foundChan, maxDepth, rateLimiter, done)
	rewriter := rewriter.NewRewriter(foundChan, outputDir, progress, onProgress)

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

	<-done
	close(foundChan)
	wg.Wait()

	return true
}
