package rewriter

import (
	"fmt"
	"io"
	"net/http"
	neturl "net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/net/html"
)

type Rewriter struct {
	foundURLChan chan string
	outputDir    string
}

func NewRewriter(foundURLChan chan string, outputDir string) *Rewriter {
	return &Rewriter{
		foundURLChan: foundURLChan,
		outputDir:    outputDir,
	}
}

func (r *Rewriter) Rewrite() {
	for rawURL := range r.foundURLChan {
		time.Sleep(100 * time.Millisecond) // 10 requests/second
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
		} else {
			r.saveBinary(resp.Body, rawURL)
		}
	}
}

func (r *Rewriter) saveBinary(body io.Reader, url string) {
	filename := r.urlToFilename(url)
	binaryFilePath := filepath.Join(r.outputDir, filename)
	fmt.Printf("Printing %s\n", binaryFilePath)

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

	fmt.Printf("Printing %s\n", htmlFilePath)

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
	path := parsedURL.Path

	if err != nil {
		return ""
	}

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
