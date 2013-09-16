.PHONY: all
all: build

#
# Compiling
#
.PHONY: build
build: static lint compile

.PHONY: static
static: $(static-resources)

.PHONY: compile
compile: $(browserify-bundle)

$(browserify-bundle): $(client-main-file) $(client-src-files) $(client-stylesheets) deps
	@mkdir -p $(@D)
	$(browserify) $< $(browserify-opts) -o $@

$(resource-dir)/%: $(client-src-dir)/%
	@mkdir -p $(@D)
	cp $< $@

#
# Dependencies
#
.PHONY: deps
deps: $(npm-dep-dir) $(bower-dep-dir)

$(npm-dep-dir): $(npm-spec)
	$(npm) install

$(bower): $(npm-dep-dir)

$(bower-dep-dir): $(bower) $(bower-spec)
	$< install

#
# Running node
#
run-deps = $(npm-spec) $(npm-dep-dir) build

.PHONY: run
run: $(run-deps)
	$(node) $(node-opts) .

.PHONY: run-dev
run-dev: $(run-deps)
	$(supervisor) $(supervisor-opts)  -- $(node-opts) .

#
# Project releases
#
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

#
# DB
#
.PHONY: db
db: $(migrations-dir) $(db-config)
	$(sequelize) --migrate --config $(db-config)

.PHONY: db-undo
db-undo: $(migrations-dir) $(db-config)
	$(sequelize) --migrate --undo --config $(db-config)

.PHONY: psql
psql:
	psql -h $(db-host) -d $(db-name)

migrations/%:
	$(sequelize) --create-migration $* --config $(db-config)

#
# Cleanup
#
.PHONY: clean
clean:
	-rm -rf $(resource-dir)

.PHONY: distclean
distclean:
	-rm -rf $(build-dir)
	-rm -rf $(npm-dep-dir)
	-rm -rf $(bower-dep-dir)

#
# Tests and quality
#
.PHONY: test
test: test-spec

.PHONY: test-spec
test-spec: $(source-files) $(client-src-files)
	$(mocha) --reporter spec $(server-test-files) $(client-test-files)

.PHONY: test-quiet
test-quiet: $(source-files) $(client-src-files)
	$(mocha) --reporter dot $(server-test-files) $(client-test-files)

.PHONY: test-watch
test-watch: $(source-files) $(client-src-files)
	$(mocha) --reporter min --watch $(server-test-files) $(client-test-files)

.PHONY: lint
lint: $(source-files) $(linter-config) $(client-src-files) deps
	$(linter) --config $(linter-config) $(source-files) $(client-src-files)

#
# Vars
#

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
mocha = $(module-root)/mocha/bin/mocha $(node-opts) $(mocha-opts)
linter = $(module-root)/jshint/bin/jshint $(linter-opts)
semver = $(module-root)/semver/bin/semver
node = node
supervisor = $(module-root)/supervisor/lib/cli-wrapper.js
npm = npm
bower = $(module-root)/bower/bin/bower
sequelize = $(module-root)/sequelize/bin/sequelize

#
# Frontend files
#
client-src-dir = ./src/client
client-src-files = \
	$(shell find $(client-src-dir)/js -type f -iname "*.js")
client-view-stylesheets = \
	$(shell find $(client-src-dir)/js -type f -iname "*.styl")
client-static-resource-files = \
	$(shell find $(client-src-dir) -type f \
		-not -path "$(client-src-dir)/js/*")
client-main-file = src/client/js/storychat.js
client-test-files = $(shell find $(client-src-dir)/js -type f -iname "*-test.js")
resource-dir = static
static-resources = \
	$(patsubst $(client-src-dir)/%,$(resource-dir)/%,$(client-static-resource-files))
build-dir = $(resource-dir)/js
browserify-bundle = $(build-dir)/storychat.js

#
# Backend files
#
source-files = $(shell find src/server -iname "*.js")
server-test-files = $(shell find src/server -iname "*-test.js")
node-main = $(shell grep main package.json | \
				sed -E 's/.*"main".*:.*"([^"]*)".*/\1/')
linter-config = $(config-dir)/jshint.conf.json
readme = README.md
npm-dep-dir = node_modules
bower-dep-dir = bower_components
npm-spec = package.json
bower-spec = bower.json
db-config = $(config-dir)/db.json

#
# Opts
#
comma:= ,
empty:=
space:= $(empty) $(empty)
config-dir = config
mocha-opts = --check-leaks --recursive
linter-opts =
browserify-opts = -t es6ify -t debowerify -t ./src/server/can.viewify -t stylify -t brfs -d
node-opts = --harmony
supervisor-opts = -w $(subst $(space),$(comma),$(source-files) $(npm-dep-dir) $(npm-spec))
db-host = localhost
db-name = storychat
