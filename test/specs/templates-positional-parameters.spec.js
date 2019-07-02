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
    numberedOne: 'abc{{{1}}}def',
    numberedTwo: 'abc{{{1}}}def{{{2}}}hij',
    'name with space': 'a b {{{1}}} c d',
    '{a': 'open curly brace {{{1}}}',
    '}b': 'closing curly brace {{{1}}}',
    '{c}': 'curly braces {{{1}}}',
    'd|': 'pipe {{{1}}}',
    'e=': 'equal sign {{{1}}}',
    nestedTwo: '{{{1}}}={{{2}}}; {{numberedTwo|222|yyy}}; {{{1}}}={{{2}}}',
    nestedTwoRef: '{{{1}}}={{{2}}}; {{numberedTwo|{{{2}}}|{{{1}}}}}; {{{1}}}={{{2}}}',
    tripleNestedTwo: '{{{1}}}={{{2}}}; {{nestedTwo|555|rrr}}; {{{1}}}={{{2}}}',
};

describe('Template tests with positional parameters', function() {

    it('one parameter', function(done) {
        let tmpl = '{{numberedOne|111}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('name with space', function(done) {
        let tmpl = '{{name with space|1}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'a b 1 c d';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('value with space', function(done) {
        let tmpl = '{{numberedOne|1 2}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc1 2def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters', function(done) {
        let tmpl = '{{numberedTwo|111|zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111defzzzhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; with trailing pipe', function(done) {
        let tmpl = '{{numberedTwo|111|zzz|}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111defzzzhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; nested, hardcoded parameters in the template', function(done) {
        let tmpl = '{{nestedTwo|111|zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; abc222defyyyhij; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; nested, parameters parameters are passed to the internal one', function(done) {
        let tmpl = '{{nestedTwoRef|111|zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; abczzzdef111hij; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; triple nested', function(done) {
        let tmpl = '{{tripleNestedTwo|111|zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; 555=rrr; abc222defyyyhij; 555=rrr; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('positional variable is used for template name', function(done) {
        let tmpl = '{{ {{{1}}}|111}}';
        let ctx = {
            templates: templateLib,
            posArgs: ['numberedOne']
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('positional variable and concatenation before is used for template name', function(done) {
        let tmpl = '{{numbered{{{1}}}|111}}';
        let ctx = {
            templates: templateLib,
            posArgs: ['One']
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('positional variable and concatenation after is used for template name', function(done) {
        let tmpl = '{{ {{{1}}}One|111}}';
        let ctx = {
            templates: templateLib,
            posArgs: ['numbered']
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('positional variables are used in parameters', function(done) {
        let tmpl = '{{numberedTwo|{{{1}}}|k{{{2}}}l}}';
        let ctx = {
            templates: templateLib,
            posArgs: [888, 'ttt']
        };
        let expected = 'abc888defktttlhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });
});