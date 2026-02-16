URL ?= https://ld-wt73.template-help.com/wt_67881/index.html
PROJECT_DIR ?= output
OUTPUT = go-copier
CLI_FOLDER = ./cmd/go-copier

.PHONY: cli

run-cli:
	go build -o $(OUTPUT) $(CLI_FOLDER)
	./$(OUTPUT) --url $(URL) --output $(PROJECT_DIR)

build-cli:
	go build -o $(OUTPUT) $(CLI_FOLDER)

install-cli:
	go install $(CLI_FOLDER)