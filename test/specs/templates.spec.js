'use strict';

/*global should render*/
// When runing in the browser, then 'render' and 'should' are already preloaded.
if (process) {
    // Running inside NodeJS
    let lib;
    // eslint-disable-next-line no-var
    var render;
    if (process.env.TEST_MODE === 'DEV') {
        // Use source code
        lib = require('../../src/private/raw-parser');
    }
    else if (process.env.TEST_MODE === 'GEN') {
        // Use source code
        lib = require('../../src/public/wiki-template-parser');
    }
    else {
        // use web-packed library
        lib = require('../../wiki-template-parser');
    }
    render = lib.render;
    require('should');
}

let templateLib = {
    plain: 'abc',
    recursiveOne: '{{plain}}',
    recursiveTwo: '{{recursiveOne}}',
    refPlain: 'plain',
    refRefPlain: 'refPlain'
};

describe('Template tests', function() {

    it('only template reference', function(done) {
        let tmpl = '{{plain}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('string before template reference', function(done) {
        let tmpl = 'aaa - {{plain}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'aaa - abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('string after template reference', function(done) {
        let tmpl = '{{plain}} - bbb';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc - bbb';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('variable before template reference', function(done) {
        let tmpl = '{{{a}}} - {{plain}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {a: 'aaa'}
        };
        let expected = 'aaa - abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('variable after template reference', function(done) {
        let tmpl = '{{plain}} - {{{b}}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {b: 'bbb'}
        };
        let expected = 'abc - bbb';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('double recursive template reference', function(done) {
        let tmpl = '{{recursiveOne}}';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('triple recursive template reference', function(done) {
        let tmpl = '{{recursiveTwo}}';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('double nested template reference', function(done) {
        let tmpl = '{{ {{refPlain}}}}';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('triple nested template reference', function(done) {
        let tmpl = '{{ {{ {{refRefPlain}}}}}}';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('using variable for a template name', function(done) {
        let tmpl = 'before {{ {{{varPlain}}}}} after';
        let ctx = {
            templates: templateLib,
            namedArgs: {varPlain: 'plain'}
        };
        let expected = 'before abc after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('using variable and concatenation for a template name', function(done) {
        let tmpl = 'before {{ {{{varPlai}}}n}} after';
        let ctx = {
            templates: templateLib,
            namedArgs: {varPlai: 'plai'}
        };
        let expected = 'before abc after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('using template for a variable name', function(done) {
        let tmpl = 'before {{{ {{plain}}}}} after';
        let ctx = {
            templates: templateLib,
            namedArgs: {abc: 'def'}
        };
        let expected = 'before def after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('using template and concatenation for a variable name', function(done) {
        let tmpl = 'before {{{ {{plain}}d}}} after';
        let ctx = {
            templates: templateLib,
            namedArgs: {abcd: 'def'}
        };
        let expected = 'before def after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('template with trailing pipe', function(done) {
        let tmpl = 'before {{plain|}} after';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'before abc after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('template with empty name', function(done) {
        let tmpl = 'before {{}} after';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'before {{}} after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('template with spaces for name', function(done) {
        let tmpl = 'before {{  }} after';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'before {{}} after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('template with empty name and trailing pipe', function(done) {
        let tmpl = 'before {{|}} after';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'before {{}} after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('template with spaces for name and trailing pipe', function(done) {
        let tmpl = 'before {{ |}} after';
        let ctx = {
            templates: templateLib,
        };
        let expected = 'before {{}} after';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

});