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

describe('Positional variables tests', function() {

    it('one argument; template consists only of a variable', function(done) {
        let tmpl = '{{{1}}}';
        let ctx = {
            posArgs: ['000']
        };
        let expected = '000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; one variable with spaces', function(done) {
        let tmpl = '{{{  1 }}}';
        let ctx = {
            posArgs: ['000']
        };
        let expected = '000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string', function(done) {
        let tmpl = 'triple-zero = {{{1}}}';
        let ctx = {
            posArgs: ['000']
        };
        let expected = 'triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; variable then text', function(done) {
        let tmpl = '{{{1}}} - triple-zero';
        let ctx = {
            posArgs: ['000']
        };
        let expected = '000 - triple-zero';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; used in multiple places', function(done) {
        let tmpl = 'triple-zero = {{{1}}}; triple-zero = {{{1}}}';
        let ctx = {
            posArgs: ['000']
        };
        let expected = 'triple-zero = 000; triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; strings; used in ascending order', function(done) {
        let tmpl = 'triple-zero = {{{1}}}; triple-one = {{{2}}}';
        let ctx = {
            posArgs: ['000', '111']
        };
        let expected = 'triple-zero = 000; triple-one = 111';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('two arguments; strings; used in descending order', function(done) {
        let tmpl = 'triple-one = {{{2}}}; triple-zero = {{{1}}}';
        let ctx = {
            posArgs: ['000', '111']
        };
        let expected = 'triple-one = 111; triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; octal-looking position', function(done) {
        let tmpl = 'triple-ten = {{{010}}}';
        let ctx = {
            posArgs: ['000', '111', '222', '333', '444', '555', '666', '777', '888', '101010', '1122']
        };
        let expected = 'triple-ten = 101010';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; integer', function(done) {
        let tmpl = 'int = {{{1}}}';
        let ctx = {
            posArgs: [15]
        };
        let expected = 'int = 15';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; boolean true', function(done) {
        let tmpl = 'boolean = {{{1}}}';
        let ctx = {
            posArgs: [true]
        };
        let expected = 'boolean = true';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; boolean false', function(done) {
        let tmpl = 'boolean = {{{1}}}';
        let ctx = {
            posArgs: [false]
        };
        let expected = 'boolean = false';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; float', function(done) {
        let tmpl = 'float = {{{1}}}';
        let ctx = {
            posArgs: [-1.25]
        };
        let expected = 'float = -1.25';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; array', function(done) {
        let tmpl = 'array = {{{1}}}';
        let ctx = {
            posArgs: [['a', 'b']]
        };
        let expected = 'array = a,b';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; object', function(done) {
        let tmpl = 'object = {{{1}}}';
        let ctx = {
            posArgs: [{a: 1, b: 2}]
        };
        // rendering of objects by position is practically useless, but should not fail
        let expected = 'object = [object Object]';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; null', function(done) {
        let tmpl = 'null = {{{1}}}';
        let ctx = {
            posArgs: [null]
        };
        let expected = 'null = null';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; undefined', function(done) {
        let tmpl = 'undefined = {{{1}}}';
        let ctx = {
            posArgs: [undefined]
        };
        let expected = 'undefined = {{{1}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; position is larger than number of parameters', function(done) {
        let tmpl = 'value at position 1 = {{{2}}}';
        let ctx = {
            posArgs: [1]
        };
        let expected = 'value at position 1 = {{{2}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; string; whitespace inside curly braces', function(done) {
        let tmpl = 'triple-zero = {{{\n\t   1\t\r   }}}';
        let ctx = {
            posArgs: ['000']
        };
        let expected = 'triple-zero = 000';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; negative position', function(done) {
        let tmpl = 'value = {{{-1}}}';
        let ctx = {
            posArgs: [1]
        };
        let expected = 'value = {{{-1}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; float used as position', function(done) {
        let tmpl = 'value = {{{1.0}}}';
        let ctx = {
            posArgs: [1]
        };
        let expected = 'value = {{{1.0}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; using space between digits', function(done) {
        let tmpl = 'value = {{{0 1}}}';
        let ctx = {
            posArgs: [1]
        };
        let expected = 'value = {{{0 1}}}';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; existing variable with pipe', function(done) {
        let tmpl = 'value = {{{1|}}}';
        let ctx = {
            posArgs: ['25']
        };
        let expected = 'value = 25';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; non-existing variable with pipe', function(done) {
        let tmpl = 'value = {{{2|}}}';
        let ctx = {
            posArgs: ['1']
        };
        let expected = 'value = ';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; existing variable with space before pipe', function(done) {
        let tmpl = 'value = {{{1 |}}}';
        let ctx = {
            posArgs: ['abc']
        };
        let expected = 'value = abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; double-nested variable', function(done) {
        let tmpl = 'value = {{{{{{1}}}}}}';
        let ctx = {
            posArgs: [2, 'abc']
        };
        let expected = 'value = abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; double-nested variable with spaces ', function(done) {
        let tmpl = 'value = {{{ {{{ 1 }}} }}}';
        let ctx = {
            posArgs: [2, 'abc']
        };
        let expected = 'value = abc';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; triple-nested variable', function(done) {
        let tmpl = 'value = {{{{{{{{{1}}}}}}}}}';
        let ctx = {
            posArgs: [2, 3, 'def']
        };
        let expected = 'value = def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; triple-nested variable with pipe at the first level', function(done) {
        let tmpl = 'value = {{{{{{{{{1}}}}}}|}}}';
        let ctx = {
            posArgs: [2, 3, 'def']
        };
        let expected = 'value = def';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; triple-nested variable with pipe at the first level (non-existing parameter)', function(done) {
        let tmpl = 'value = {{{{{{{{{1}}}}}}|}}}';
        let ctx = {
            posArgs: [2, 4, 'def']
        };
        let expected = 'value = ';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

    it('one argument; triple-nested variable with pipe at the first level (non-existing parameter); with spaces', function(done) {
        let tmpl = 'value = {{{ {{{{{{1}}}\t}}} |}}}';
        let ctx = {
            posArgs: [2, 4, 'def']
        };
        let expected = 'value = ';
        should.strictEqual(expected, render(tmpl, ctx));

        done();
    });

});