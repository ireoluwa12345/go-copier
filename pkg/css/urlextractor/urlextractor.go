package urlextractor

import (
	"regexp"
)

type Pattern struct {
	re *regexp.Regexp
}

type Extractor struct {
	patterns []*Pattern
}

func NewExtractor() *Extractor {
	return &Extractor{
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
	urls := make([]string, 0)
	for _, pattern := range p.patterns {
		matches := pattern.re.FindAllStringSubmatch(css, -1)
		for _, match := range matches {
			if len(match) > 1 {
				urls = append(urls, match[1])
			}
		}
	}
	return urls
}
