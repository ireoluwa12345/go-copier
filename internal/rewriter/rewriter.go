package rewriter

import (
	"fmt"
	"io"
	"net/http"
	neturl "net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"

	"golang.org/x/net/html"
)

type Rewriter struct {
	foundURLChan chan string
	outputDir    string
	progress     *Progress
	onProgress   func(*Progress)
}

type Progress struct {
	URLsFound  int32
	URLsDone   int32
	IsComplete bool
}

func NewRewriter(foundURLChan chan string, outputDir string, progress *Progress, onProgress func(*Progress)) *Rewriter {
	return &Rewriter{
		foundURLChan: foundURLChan,
		outputDir:    outputDir,
		progress:     progress,
		onProgress:   onProgress,
	}
}

func (r *Rewriter) Rewrite() {
	var wg sync.WaitGroup

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go r.worker(&wg)
	}

	wg.Wait()
}

func (r *Rewriter) worker(wg *sync.WaitGroup) {
	defer wg.Done()

	for rawURL := range r.foundURLChan {
		if r.progress != nil {
			atomic.AddInt32(&r.progress.URLsFound, 1)
		}
		resp, err := http.Get(rawURL)
		if err != nil {
			fmt.Println("Error fetching:", err)
			continue
		}
		defer resp.Body.Close()

		contentType := resp.Header.Get("Content-Type")
		if strings.Contains(contentType, "text/html") {
			doc, err := html.Parse(resp.Body)
			if err != nil {
				fmt.Println("Error parsing HTML:", err)
				continue
			}

			r.rewriteHTML(doc)
			r.saveHTML(doc, rawURL)
		} else if strings.Contains(contentType, "image/") ||
			strings.Contains(contentType, "css") ||
			strings.Contains(contentType, "javascript") ||
			strings.Contains(contentType, "font") {
			r.saveBinary(resp.Body, rawURL)
		} else {
			r.saveBinary(resp.Body, rawURL)
		}

		if r.progress != nil {
			atomic.AddInt32(&r.progress.URLsDone, 1)
			if r.onProgress != nil {
				r.onProgress(r.progress)
			}
		}
	}
}

func (r *Rewriter) saveBinary(body io.Reader, url string) {
	filename := r.urlToFilename(url)
	binaryFilePath := filepath.Join(r.outputDir, filename)
	// fmt.Printf("Printing %s\n", binaryFilePath)s

	dir := filepath.Dir(binaryFilePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Println("Error creating directory:", err)
		return
	}

	f, err := os.Create(binaryFilePath)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}

	defer f.Close()
	io.Copy(f, body)
}

func (r *Rewriter) saveHTML(root *html.Node, url string) {
	filename := r.urlToFilename(url)
	htmlFilePath := filepath.Join(r.outputDir, filename)

	// fmt.Printf("Printing %s\n", htmlFilePath)

	dir := filepath.Dir(htmlFilePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		fmt.Println("Error creating directory:", err)
		return
	}

	f, err := os.Create(htmlFilePath)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer f.Close()

	err = html.Render(f, root)
	if err != nil {
		fmt.Println("Error rendering HTML:", err)
		return
	}
}

func (r *Rewriter) rewriteHTML(root *html.Node) {
	stack := []*html.Node{root}

	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if node.Type == html.ElementNode && node.Data == "a" {
			for _, attr := range node.Attr {
				if attr.Key == "href" {
					href := attr.Val
					if strings.HasPrefix(href, "#") {
						continue
					}
					attr.Val = r.urlToFilename(href)
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "img" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					src := attr.Val
					if strings.HasPrefix(src, "#") {
						continue
					}
					attr.Val = r.urlToFilename(src)
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "script" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					src := attr.Val
					if strings.HasPrefix(src, "#") {
						continue
					}
					attr.Val = r.urlToFilename(src)
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "link" {
			for _, attr := range node.Attr {
				if attr.Key == "href" {
					href := attr.Val
					if strings.HasPrefix(href, "#") {
						continue
					}
					attr.Val = r.urlToFilename(href)
				}
			}
		}

		for child := node.FirstChild; child != nil; child = child.NextSibling {
			stack = append(stack, child)
		}
	}
}

func (*Rewriter) urlToFilename(url string) string {
	parsedURL, err := neturl.Parse(url)

	if err != nil {
		return ""
	}

	path := parsedURL.Path

	path = strings.TrimSuffix(path, "?")
	path = strings.TrimSuffix(path, "#")

	if strings.HasPrefix(path, "#") {
		return ""
	}

	if path == "" || path == "/" {
		return "index.html"
	}

	path = strings.TrimPrefix(path, "/")
	if filepath.Ext(path) == "" {
		path = path + ".html"
	}

	return path
}
