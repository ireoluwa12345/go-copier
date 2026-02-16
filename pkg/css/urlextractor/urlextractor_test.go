package urlextractor_test

import (
	"testing"

	"github.com/ireoluwa12345/go-copier/pkg/css/urlextractor"
)

func TestExtract(t *testing.T) {
	extractor := urlextractor.NewExtractor()
	urls := extractor.Extract(`
		body {
			background-image: url("https://example.com/image.png");
			background-image: url('https://example.com/image.png');
			background-image: url(https://example.com/image.png);
			background-image: url("https://example.com/image.png");
			background-image: url('https://example.com/image.png');
			background-image: url(https://example.com/image.png);
		}
	`)
	expected := []string{
		"https://example.com/image.png",
	}
	if len(urls) != len(expected) {
		t.Errorf("Expected %d urls, got %d", len(expected), len(urls))
	}
	for i, url := range urls {
		if url != expected[i] {
			t.Errorf("Expected %s, got %s", expected[i], url)
		}
	}
}

func TestExtractImport(t *testing.T) {
	extractor := urlextractor.NewExtractor()
	urls := extractor.Extract(`
		@import url("https://example.com/style.css");
		@import url('https://example.com/style.css');
		@import url(https://example.com/style.css);
		@import url("https://example.com/style.css");
		@import url('https://example.com/style.css');
		@import url(https://example.com/style.css);
	`)
	expected := []string{
		"https://example.com/style.css",
	}
	if len(urls) != len(expected) {
		t.Errorf("Expected %d urls, got %d", len(expected), len(urls))
	}
	for i, url := range urls {
		if url != expected[i] {
			t.Errorf("Expected %s, got %s", expected[i], url)
		}
	}
}

func TestExtractMultiple(t *testing.T) {
	extractor := urlextractor.NewExtractor()
	urls := extractor.Extract(`
		body {
			background-image: url("https://example.com/image.png");
			background-image: url('https://example.com/image.png');
			background-image: url(https://example.com/image.png);
			background-image: url("https://example.com/image.png");
			background-image: url('https://example.com/image.png');
			background-image: url(https://example.com/image.png);
			background-image: url("https://example.com/image.png");
			background-image: url('https://example.com/image.png');
			background-image: url(https://example.com/image.png);
		}
		@import url("https://example.com/style.css");
		@import url('https://example.com/style.css');
		@import url(https://example.com/style.css);
		@import url("https://example.com/style.css");
		@import url('https://example.com/style.css');
		@import url(https://example.com/style.css);
	`)
	expected := []string{
		"https://example.com/image.png",
		"https://example.com/style.css",
	}
	if len(urls) != len(expected) {
		t.Errorf("Expected %d urls, got %d", len(expected), len(urls))
	}
	for i, url := range urls {
		if url != expected[i] {
			t.Errorf("Expected %s, got %s", expected[i], url)
		}
	}
}
