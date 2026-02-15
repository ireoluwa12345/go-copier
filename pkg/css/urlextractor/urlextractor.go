package urlextractor

import (
	"regexp"
)

type Pattern struct {
	re *regexp.Regexp
}

type Extractor struct {
	patterns []*Pattern
	urls     []string
}

func NewExtractor() *Extractor {
	return &Extractor{
		urls: make([]string, 0),
		patterns: []*Pattern{
			{
				re: regexp.MustCompile(`url\(['"]?([^'"\)]+)['"]?\)`),
			},
			{
				re: regexp.MustCompile(`@import\s+(?:url\(['"]?([^'"\)]+)['"]?\)|['"]([^'"]+)['"])`),
			},
		},
	}
}

func (p *Extractor) Extract(css string) []string {
	for _, pattern := range p.patterns {
		matches := pattern.re.FindAllStringSubmatch(css, -1)
		for _, match := range matches {
			if len(match) > 1 {
				p.urls = append(p.urls, match[1])
			}
		}
	}
	return p.urls
}
