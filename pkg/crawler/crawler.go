package crawler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"golang.org/x/net/html"
)

type Crawler struct {
	startURL     string
	mu           sync.RWMutex
	visited      map[string]bool
	foundURLChan chan string
}

func NewCrawler(url string, foundURLChan chan string) *Crawler {
	return &Crawler{
		startURL:     url,
		foundURLChan: foundURLChan,
		visited:      make(map[string]bool),
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

	queue := make(chan string, 1000)

	for i := 0; i < 2; i++ {
		wg.Add(1)
		go c.worker(queue, &wg, &pending)
	}

	atomic.AddInt64(&pending, 1)
	queue <- c.startURL

	duration := time.Duration(time.Second * 10)
	for atomic.LoadInt64(&pending) > 0 {
		time.Sleep(duration)
	}
	close(queue)
	wg.Wait()
	fmt.Println("Crawling complete!")
	close(c.foundURLChan)
}

func (c *Crawler) worker(queue chan string, wg *sync.WaitGroup, pending *int64) {
	defer wg.Done()
	for rawURL := range queue {
		if !c.CheckAndMark(rawURL) {
			atomic.AddInt64(pending, -1)
			continue
		}

		fmt.Println("Crawling:", rawURL)

		baseURL, err := url.Parse(rawURL)
		if err != nil {
			fmt.Println("Error parsing URL:", err)
			atomic.AddInt64(pending, -1)
			continue
		}

		time.Sleep(100 * time.Millisecond) // 10 requests/second
		resp, err := http.Get(rawURL)
		if err != nil {
			fmt.Println("Error fetching:", err)
			atomic.AddInt64(pending, -1)
			continue
		}

		doc, err := html.Parse(resp.Body)
		resp.Body.Close()
		if err != nil {
			fmt.Println("Error parsing HTML:", err)
			atomic.AddInt64(pending, -1)
			continue
		}

		c.extractLinks(doc, queue, baseURL, pending)

		atomic.AddInt64(pending, -1)
	}
}

func (c *Crawler) extractLinks(root *html.Node, queue chan string, baseURL *url.URL, pending *int64) {
	stack := []*html.Node{root}

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

					resolved := baseURL.ResolveReference(&url.URL{Path: href})

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					if !c.CheckAndMark(cleanURL) {
						continue
					}

					fmt.Printf("Found URL: %s\n", cleanURL)
					atomic.AddInt64(pending, 1)
					queue <- cleanURL
					c.foundURLChan <- cleanURL
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "img" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					src := attr.Val

					if strings.HasPrefix(src, "mailto:") ||
						strings.HasPrefix(src, "javascript:") ||
						strings.HasPrefix(src, "tel:") ||
						strings.HasPrefix(src, "#") {
						continue
					}

					resolved := baseURL.ResolveReference(&url.URL{Path: src})

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					if !c.CheckAndMark(cleanURL) {
						continue
					}

					fmt.Printf("Found URL: %s\n", cleanURL)
					atomic.AddInt64(pending, 1)
					queue <- cleanURL
					c.foundURLChan <- cleanURL
				}
			}
		}

		if node.Type == html.ElementNode && node.Data == "script" {
			for _, attr := range node.Attr {
				if attr.Key == "src" {
					src := attr.Val

					if strings.HasPrefix(src, "mailto:") ||
						strings.HasPrefix(src, "javascript:") ||
						strings.HasPrefix(src, "tel:") ||
						strings.HasPrefix(src, "#") {
						continue
					}

					resolved := baseURL.ResolveReference(&url.URL{Path: src})

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					if !c.CheckAndMark(cleanURL) {
						continue
					}

					fmt.Printf("Found URL: %s\n", cleanURL)
					atomic.AddInt64(pending, 1)
					queue <- cleanURL
					c.foundURLChan <- cleanURL
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

					resolved := baseURL.ResolveReference(&url.URL{Path: href})

					if resolved.Host != baseURL.Host {
						continue
					}

					cleanURL := resolved.String()

					if !c.CheckAndMark(cleanURL) {
						continue
					}

					fmt.Printf("Found URL: %s\n", cleanURL)
					atomic.AddInt64(pending, 1)
					queue <- cleanURL
					c.foundURLChan <- cleanURL
				}
			}
		}

		for child := node.FirstChild; child != nil; child = child.NextSibling {
			stack = append(stack, child)
		}
	}
}
