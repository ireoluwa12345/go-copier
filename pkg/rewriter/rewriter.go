package rewriter

import "fmt"

type Rewriter struct{}

func NewRewriter() *Rewriter {
	return &Rewriter{}
}

func (r *Rewriter) Rewrite(urlChan <-chan string) {
	for url := range urlChan {
		fmt.Println("Rewriting:", url)
	}
}
