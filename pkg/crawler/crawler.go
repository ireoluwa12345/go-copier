package crawler

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"

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

	queue := make(chan string, 1000)

	for i := 0; i < 10; i++ {
		wg.Add(1)
		go c.worker(queue, &wg)
	}

	queue <- c.startURL
	wg.Wait()

	defer close(c.foundURLChan)
}

func (c *Crawler) worker(queue chan string, wg *sync.WaitGroup) {
	for rawURL := range queue {
		if !c.CheckAndMark(rawURL) {
			fmt.Printf("Skipping already visited: %s\n", rawURL)
			continue
		}

		fmt.Println("Crawling:", rawURL)

		baseURL, err := url.Parse(rawURL)
		if err != nil {
			fmt.Println("Error parsing URL:", err)
			continue
		}

		resp, err := http.Get(rawURL)
		if err != nil {
			fmt.Println("Error fetching:", err)
			continue
		}

		doc, err := html.Parse(resp.Body)
		resp.Body.Close()
		if err != nil {
			fmt.Println("Error parsing HTML:", err)
			continue
		}

		c.extractLinks(doc, queue, baseURL)
		wg.Done()
	}
}

func (c *Crawler) extractLinks(n *html.Node, queue chan string, baseURL *url.URL) {
	if n.Type == html.ElementNode && (n.Data == "a" || n.Data == "img") {
		for _, attr := range n.Attr {
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

				fmt.Printf("Found URL: %s(%d)\n", cleanURL, len(queue))
				queue <- cleanURL
				c.foundURLChan <- cleanURL
			}
		}
	}

	for child := n.FirstChild; child != nil; child = child.NextSibling {
		c.extractLinks(child, queue, baseURL)
	}
}
