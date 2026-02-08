URL ?= https://ld-wt73.template-help.com/wt_67881/index.html
OUTPUT = go-copier

build-and-run:
	go build -o $(OUTPUT)
	./$(OUTPUT) $(URL)

build:
	go build -o $(OUTPUT)