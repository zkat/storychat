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
linter = $(module-root)/jshint/bin/jshint $(linter-opts)
semver = $(module-root)/semver/bin/semver
node = node
supervisor = $(module-root)/supervisor/lib/cli-wrapper.js

#
# Frontend files
#
client-src-dir = src/client/js
client-src-files = $(shell find $(client-src-dir) -iname "*.js")
client-stylesheets = $(shell find $(client-src-dir) -iname "*.styl")
client-main-file = src/client/js/storychat.js
resource-dir = static
build-dir = $(resource-dir)/js
browserify-bundle = $(build-dir)/storychat.js

#
# Backend files
#
source-files = $(shell find src/server -iname "*.js")
node-main = $(shell grep main package.json | \
				sed -E 's/.*"main".*:.*"([^"]*)".*/\1/')
linter-config = jshint.conf.json
readme = README.md
npm-dep-dir = node_modules
bower-dep-dir = bower_components
npm-spec = package.json
bower-spec = bower.json

#
# Opts
#
comma:= ,
empty:=
space:= $(empty) $(empty)
linter-opts =
browserify-opts = -t es6ify -t debowerify -t ./src/server/can.viewify -t stylify -t brfs -d
supervisor-opts = -w $(subst $(space),$(comma),$(source-files) $(npm-dep-dir) $(npm-spec))

#
# Targets
#
.PHONY: all
all: lint compile

.PHONY: run
run: $(npm-spec) $(npm-dep-dir)
	$(node) .

.PHONY: run-dev
run-dev: $(npm-spec) $(npm-dep-dir)
	$(supervisor) $(supervisor-opts) .

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

$(browserify-bundle): $(client-main-file) $(client-src-files) $(client-stylesheets) deps
	@mkdir -p $(@D)
	$(browserify) $< $(browserify-opts) -o $@

$(build-dir):
	mkdir -p $@

.PHONY: clean
clean:
	-rm -rf $(build-dir)

.PHONY: distclean
distclean:
	-rm -rf $(build-dir)
	-rm -rf $(npm-dep-dir)
	-rm -rf $(bower-dep-dir)

.PHONY: lint
lint: $(source-files) $(linter-config) $(client-src-files) deps
	$(linter) --config $(linter-config) $(source-files) $(client-src-files)

.PHONY: deps
deps: $(npm-dep-dir) $(bower-dep-dir)

$(npm-dep-dir): $(npm-spec)
	npm install

$(bower-dep-dir): $(bower-spec)
	bower install
