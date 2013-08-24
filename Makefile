#
# Binaries
#
ifdef watch
browserify-name = watchify
else
browserify-name = browserify
endif

module-root = ./node_modules
uglify = $(module-root)/uglify-js/bin/uglifyjs
browserify = $(module-root)/$(browserify-name)/bin/cmd.js
jsdoc = $(module-root)/jsdoc/jsdoc
mocha = $(module-root)/mocha/bin/mocha $(mocha-opts)
linter = $(module-root)/jshint/bin/jshint $(linter-opts)
semver = $(module-root)/semver/bin/semver
node = node
supervisor = $(module-root)/supervisor/lib/cli-wrapper.js

#
# Opts
#
mocha-opts = --check-leaks
linter-opts =
browserify-opts = -t es6ify -t debowerify -d

#
# Files
#
client-src-dir = src/client/js
client-src-files = $(shell find $(client-src-dir) -iname "*.js");
client-main-file = src/client/js/storychat.js
source-files = $(shell find src -iname "*.js" -a -not -path "./src/client/*")
node-main = src/storychat.js
resource-dir = static
build-dir = $(resource-dir)/js
browserify-bundle = $(build-dir)/storychat.js
linter-config = jshint.conf.json
readme = README.md

#
# Targets
#
.PHONY: all
all: compile

.PHONY: run
run: $(node-main) compile
	$(node) $<

.PHONY: run-dev
run-dev: $(node-main) compile
	$(supervisor) $<

.PHONY: compile
compile: $(browserify-bundle)

.PHONY: release-%
release-%: all
	npm version $* -m "Upgrading storychat to %s" ;
	git checkout master ; \
	git merge develop --ff-only ; \
	git checkout develop

.PHONY: publish
publish:
	git push
	git push --tags
	npm publish .

$(browserify-bundle): $(client-main-file) $(client-src-files)
	@mkdir -p $(@D)
	$(browserify) $< $(browserify-opts) -o $@

$(build-dir):
	mkdir -p $@

.PHONY: clean
clean:
	-rm -rf $(build-dir)

.PHONY: test
test: test-spec

.PHONY: test-spec
test-spec: $(source-files)
	$(mocha) --reporter spec

.PHONY: test-quiet
test-quiet: $(source-files)
	$(mocha) --reporter dot

.PHONY: test-watch
test-watch: $(source-files)
	$(mocha) --reporter min --watch

.PHONY: lint
lint: $(source-files) $(linter-config)
	$(linter) --config $(linter-config) $(source-files)
