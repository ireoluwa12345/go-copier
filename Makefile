URL ?= https://ld-wt73.template-help.com/wt_67881/index.html
PROJECT_DIR ?= output
OUTPUT = go-copier

.PHONY: cli

cli:
	go build -o $(OUTPUT) ./cmd/cli
	./$(OUTPUT) --url $(URL) --output $(PROJECT_DIR)

build-cli:
	go build -o $(OUTPUT) ./cmd/cli