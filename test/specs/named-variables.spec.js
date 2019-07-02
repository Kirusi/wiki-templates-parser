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

describe('Named scalar variables tests', function() {

    it('one argument; template consists only of a variable', function(done) {
        let tmpl = '{{{a}}}';
        let ctx = {
            namedArgs: {a: 'aaa'}
        };
        let expected = 'aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string', function(done) {
        let tmpl = 'a = {{{a}}}';
        let ctx = {
            namedArgs: {a: 'aaa'}
        };
        let expected = 'a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; text after variable', function(done) {
        let tmpl = '{{{a}}} - a';
        let ctx = {
            namedArgs: {a: 'aaa'}
        };
        let expected = 'aaa - a';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; strings', function(done) {
        let tmpl = 'b = {{{b}}}; a = {{{a}}}';
        let ctx = {
            namedArgs: {a: 'aaa', b: 'bbb'}
        };
        let expected = 'b = bbb; a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with underscore', function(done) {
        let tmpl = 'value = {{{_1a}}}';
        let ctx = {
            namedArgs: {_1a: '111'}
        };
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with dollar sign', function(done) {
        let tmpl = 'value = {{{$1a}}}';
        let ctx = {
            namedArgs: {$1a: '111'}
        };
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name begins with dollar sign which look like jison internal variables', function(done) {
        let tmpl = 'value1 = {{{$1}}}; value2 = {{{$2}}}; value$ = {{{$$}}}';
        let ctx = {
            namedArgs: {$1: '111', $2: '222', $$: '333'}
        };
        let expected = 'value1 = 111; value2 = 222; value$ = 333';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name contains open curly brace', function(done) {
        let tmpl = 'value = {{{a{A}}}';
        let ctx = {
            namedArgs: {'a{A': '111'}
        };
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name contains closing curly brace', function(done) {
        let tmpl = 'value = {{{a}A}}}';
        let ctx = {
            namedArgs: {'a}A': '111'}
        };
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; whitespace inside curly braces', function(done) {
        let tmpl = 'a = {{{  \t\ra\n  \t}}}';
        let ctx = {
            namedArgs: {a: 'aaa'}
        };
        let expected = 'a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; name contains an minus character', function(done) {
        let tmpl = 'value = {{{a-A}}}';
        let ctx = {
            namedArgs: {'a-A': '111'}
        };
        let expected = 'value = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; missing open curly brace', function(done) {
        let tmpl = 'value = A}}}';
        let ctx = {
            namedArgs: {}
        };
        let expected = 'value = A}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; missing closing curly brace', function(done) {
        try {
            let tmpl = 'value = {{{a';
            let ctx = {
                namedArgs: {a: 'a1'}
            };
            render(tmpl, ctx);
            should.fail('Undetected error');
        }
        catch (err) {
            let msg = err.message;
            msg.should.containEql('Parse error');
            msg.should.containEql('{a');
            msg.should.containEql('Expecting');
            should.deepEqual({ first_line: 1, last_line: 1, first_column: 11, last_column: 12 }, err.hash.loc);
        }

        done();
    });

    it('one argument; optional; existing', function(done) {
        let tmpl = 'a = {{{a|}}}';
        let ctx = {
            namedArgs: {a: 'aaa'}
        };
        let expected = 'a = aaa';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; optional; non-existing', function(done) {
        let tmpl = 'a = {{{a|}}}';
        let ctx = {
            namedArgs: {b: 'bbb'}
        };
        let expected = 'a = ';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

});