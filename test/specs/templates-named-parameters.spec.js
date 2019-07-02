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
    numberedOne: 'abc{{{a}}}def',
    numberedTwo: 'abc{{{a}}}def{{{b}}}hij',
    'param name': 'a b {{{param name}}} c d',
    '{a': 'open curly brace {{{\\{a}}}',
    '}b': 'closing curly brace {{{\\}b}}}',
    '{c}': 'curly braces {{{\\{c\\}}}}',
    'd|': 'pipe {{{d\\|}}}',
    'e=': 'equal sign {{{e\\=}}}',
    nestedTwo: '{{{a}}}={{{b}}}; {{numberedTwo|a=222|b=yyy}}; {{{a}}}={{{b}}}',
    nestedTwoRef: '{{{a}}}={{{b}}}; {{numberedTwo|a={{{b}}}|b={{{a}}}}}; {{{a}}}={{{b}}}',
    tripleNestedTwo: '{{{a}}}={{{b}}}; {{nestedTwo|a=555|b=rrr}}; {{{a}}}={{{b}}}',
};

describe('Template tests with named parameters', function() {

    it('one parameter', function(done) {
        let tmpl = '{{numberedOne|a=111}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('name with space', function(done) {
        let tmpl = '{{param name|param name=1}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'a b 1 c d';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('value with space', function(done) {
        let tmpl = '{{numberedOne|a=1 2}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc1 2def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters', function(done) {
        let tmpl = '{{numberedTwo|a=111|b=zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111defzzzhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; with trailing pipe', function(done) {
        let tmpl = '{{numberedTwo|a=111|b=zzz|}}';
        let ctx = {
            templates: templateLib
        };
        let expected = 'abc111defzzzhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; nested, hardcoded parameters in the template', function(done) {
        let tmpl = '{{nestedTwo|a=111|b=zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; abc222defyyyhij; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; nested, parameters parameters are passed to the internal one', function(done) {
        let tmpl = '{{nestedTwoRef|a=111|b=zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; abczzzdef111hij; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two parameters; triple nested', function(done) {
        let tmpl = '{{tripleNestedTwo|a=111|b=zzz}}';
        let ctx = {
            templates: templateLib
        };
        let expected = '111=zzz; 555=rrr; abc222defyyyhij; 555=rrr; 111=zzz';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('named variable is used for template name', function(done) {
        let tmpl = '{{ {{{t}}}|a=111}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {t: 'numberedOne'}
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('named variable and concatenation before is used for template name', function(done) {
        let tmpl = '{{numbered{{{t}}}|a=111}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {t: 'One'}
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('named variable and concatenation is used for template name', function(done) {
        let tmpl = '{{ {{{t}}}One|a=111}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {t: 'numbered'}
        };
        let expected = 'abc111def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('named variables are used in parameters', function(done) {
        let tmpl = '{{numberedTwo|a={{{a}}}|b=k{{{b}}}l}}';
        let ctx = {
            templates: templateLib,
            namedArgs: {a: 888, b: 'ttt'}
        };
        let expected = 'abc888defktttlhij';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });
});