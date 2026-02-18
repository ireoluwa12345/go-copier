package crawler

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"

	"golang.org/x/net/html"
	"golang.org/x/time/rate"

	"github.com/ireoluwa12345/go-copier/pkg/css/urlextractor"
)

type Crawler struct {
	startURL     string
	mu           sync.RWMutex
	visited      map[string]bool
	foundURLChan chan string
	maxDepth     int
	rateLimiter  *rate.Limiter
	noOfWorkers  int
	done         chan struct{}
}

type urlQueue struct {
	URL   string
	Depth int
}

const defaultNoOfWorkers = 5

func NewCrawler(url string, foundURLChan chan string, maxDepth int, rateLimiter *rate.Limiter, done chan struct{}) *Crawler {
	return &Crawler{
		startURL:     url,
		foundURLChan: foundURLChan,
		visited:      make(map[string]bool),
		maxDepth:     maxDepth,
		rateLimiter:  rateLimiter,
		noOfWorkers:  defaultNoOfWorkers,
		done:         done,
	}
}

func (c *Crawler) CheckAndMark(url string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.visited[url] {
		return false
	}
	c.visited[url] = true
	return true
}

func (c *Crawler) Crawl() {
	var wg sync.WaitGroup
	var pending int64

	queue := make(chan urlQueue, 1000)

	for i := 0; i < c.noOfWorkers; i++ {
		wg.Add(1)
		go c.worker(queue, &wg, &pending)
	}

	atomic.AddInt64(&pending, 1)
	queue <- urlQueue{URL: c.startURL, Depth: 0}
	c.foundURLChan <- c.startURL

	go func() {
		for {
			if atomic.LoadInt64(&pending) == 0 {
				close(queue)
				close(c.done)
				return
			}
		}
	}()

	wg.Wait()
}

func (c *Crawler) worker(queue chan urlQueue, wg *sync.WaitGroup, pending *int64) {
	defer wg.Done()
	for q := range queue {
		if q.Depth > c.maxDepth {
			atomic.AddInt64(pending, -1)
			continue
		}

		if !c.CheckAndMark(q.URL) {
			atomic.AddInt64(pending, -1)
			continue
		}

		// fmt.Println("Crawling:", rawURL)

		baseURL, err := url.Parse(q.URL)
		if err != nil {
			fmt.Println("Error parsing URL:", err)
			atomic.AddInt64(pending, -1)
			continue
		}

		err = c.rateLimiter.Wait(context.Background())
		if err != nil {
			fmt.Println("Error waiting for rate limiter:", err)
			atomic.AddInt64(pending, -1)
			continue
		}
		resp, err := http.Get(q.URL)
		if err != nil {
			fmt.Println("Error fetching:", err)
			atomic.AddInt64(pending, -1)
			continue
		}

		contentType := resp.Header.Get("Content-Type")
		if strings.Contains(contentType, "text/html") {

			doc, err := html.Parse(resp.Body)
			resp.Body.Close()
			if err != nil {
				fmt.Println("Error parsing HTML:", err)
				atomic.AddInt64(pending, -1)
				continue
			}
			c.extractLinks(doc, queue, baseURL, pending, q.Depth)

		} else if strings.Contains(contentType, "text/css") {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			urls := urlextractor.NewExtractor().Extract(string(body))

			for _, extractedURL := range urls {
				c.processURL(extractedURL, baseURL, queue, pending, q.Depth)
			}
		} else {
			resp.Body.Close()
		}
		atomic.AddInt64(pending, -1)
	}
}

func (c *Crawler) processURL(rawURL string, baseURL *url.URL, queue chan urlQueue, pending *int64, currentDepth int) {
	if rawURL == "" ||
		strings.HasPrefix(rawURL, "mailto:") ||
		strings.HasPrefix(rawURL, "javascript:") ||
		strings.HasPrefix(rawURL, "tel:") ||
		strings.HasPrefix(rawURL, "#") {
		return
	}

	refURL, err := url.Parse(rawURL)
	if err != nil {
		return
	}

	resolved := baseURL.ResolveReference(refURL)

	if resolved.Host != baseURL.Host {
		return
	}

	cleanURL := resolved.String()

	c.mu.RLock()
	alreadyVisited := c.visited[cleanURL]
	c.mu.RUnlock()

	if alreadyVisited {
		return
	}

	newDepth := currentDepth + 1
	if newDepth > c.maxDepth {
		return
	}

	atomic.AddInt64(pending, 1)
	queue <- urlQueue{URL: cleanURL, Depth: newDepth}
	c.foundURLChan <- cleanURL
}

func (c *Crawler) processSrcset(srcset string, baseURL *url.URL, queue chan urlQueue, pending *int64, currentDepth int) {
	parts := strings.Split(srcset, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if spaceIdx := strings.Index(part, " "); spaceIdx != -1 {
			part = part[:spaceIdx]
		}
		c.processURL(part, baseURL, queue, pending, currentDepth)
	}
}

func (c *Crawler) processStyle(style string, baseURL *url.URL, queue chan urlQueue, pending *int64, currentDepth int) {
	re := regexp.MustCompile(`url\(['"]?([^'"\)]+)['"]?\)`)
	matches := re.FindAllStringSubmatch(style, -1)
	for _, match := range matches {
		if len(match) > 1 {
			c.processURL(match[1], baseURL, queue, pending, currentDepth)
		}
	}
}

func (c *Crawler) extractLinks(root *html.Node, queue chan urlQueue, baseURL *url.URL, pending *int64, currentDepth int) {
	stack := []*html.Node{root}
	newDepth := currentDepth + 1

	for len(stack) > 0 {
		node := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if node.Type == html.ElementNode && node.Data == "a" {
			for _, attr := range node.Attr {
				if attr.Key == "href" {
					href := attr.Val

					if strings.HasPrefix(href, "mailto:") ||
						strings.HasPrefix(href, "javascript:") ||
						strings.HasPrefix(href, "tel:") ||
						strings.HasPrefix(href, "#") {
						continue
					}

					refURL, err := url.Parse(href)
					if err != nil {
						continue
					}
					resolved := baseURL.ResolveReference(refURL)

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					if !c.CheckAndMark(cleanURL) {
						continue
					}

					if newDepth > c.maxDepth {
						continue
					}

					atomic.AddInt64(pending, 1)
					queue <- urlQueue{URL: cleanURL, Depth: newDepth}
					c.foundURLChan <- cleanURL
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "img" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					c.processURL(attr.Val, baseURL, queue, pending, newDepth)
				}
				if attr.Key == "srcset" {
					c.processSrcset(attr.Val, baseURL, queue, pending, newDepth)
				}
			}
		}

		if node.Type == html.ElementNode {
			for _, attr := range node.Attr {
				if attr.Key == "style" {
					c.processStyle(attr.Val, baseURL, queue, pending, newDepth)
				}
				if strings.HasPrefix(attr.Key, "data-") {
					c.processURL(attr.Val, baseURL, queue, pending, newDepth)
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "script" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					c.processURL(attr.Val, baseURL, queue, pending, newDepth)
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "link" {
			for _, attr := range node.Attr {
				if attr.Key == "href" {
					href := attr.Val

					if strings.HasPrefix(href, "mailto:") ||
						strings.HasPrefix(href, "javascript:") ||
						strings.HasPrefix(href, "tel:") ||
						strings.HasPrefix(href, "#") {
						continue
					}

					refURL, err := url.Parse(href)
					if err != nil {
						continue
					}
					resolved := baseURL.ResolveReference(refURL)

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					c.mu.RLock()
					alreadyVisited := c.visited[cleanURL]
					c.mu.RUnlock()

					if alreadyVisited {
						continue
					}

					if newDepth > c.maxDepth {
						continue
					}

					atomic.AddInt64(pending, 1)
					queue <- urlQueue{URL: cleanURL, Depth: newDepth}
					c.foundURLChan <- cleanURL
				}
			}
		}

		for child := node.FirstChild; child != nil; child = child.NextSibling {
			stack = append(stack, child)
		}
	}
}
