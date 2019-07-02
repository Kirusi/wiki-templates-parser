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
    // eslint-disable-next-line no-var
    var TrackingVisitor = require('../helpers/tracking-visitor');
}

let ctx, visitor;

describe('Link tests', function() {

    beforeEach((done) => {
        visitor = new TrackingVisitor();
        ctx = {
            visitors: [visitor]
        };
        done();
    });

    it('only link', function(done) {
        let tmpl = '[[link]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('link before text', function(done) {
        let tmpl = '[[link]] abc';
        let expected = 'link abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('link after text', function(done) {
        let tmpl = 'abc [[link]]';
        let expected = 'abc link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('double nested link', function(done) {
        let tmpl = '[[[[link]]]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual([
            'LINK|link|undefined',
            'LINK|link|undefined'
        ], visitor.history);

        done();
    });

    it('opening tag before link', function(done) {
        let tmpl = '[[ [[link]]';
        let expected = '[[ link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('closing tag before link', function(done) {
        let tmpl = ']] [[link]]';
        let expected = ']] link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('opening tag after link', function(done) {
        let tmpl = '[[link]] [[ ';
        let expected = 'link [[ ';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('closing tag after link', function(done) {
        let tmpl = '[[link]] ]]';
        let expected = 'link ]]';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('single open bracket within a link', function(done) {
        let tmpl = '[[li[nk]] abc';
        let expected = 'li[nk abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|li[nk|undefined'], visitor.history);

        done();
    });

    it('single close bracket within a link', function(done) {
        let tmpl = '[[li]nk]] abc';
        let expected = 'li]nk abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|li]nk|undefined'], visitor.history);

        done();
    });

    it('trim spaces for link value', function(done) {
        let tmpl = '[[  link ]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('trim whitespace for link value', function(done) {
        let tmpl = '[[\n\t   \rlink\r\n  \t]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('positional variable inside link', function(done) {
        let tmpl = '[[{{{1}}}]]';
        let expected = 'link';
        ctx.posArgs = ['link'];
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('named variable inside link', function(done) {
        let tmpl = '[[{{{var1}}}]]';
        let expected = 'link';
        ctx.namedArgs = { var1: 'link'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('template inside link', function(done) {
        let tmpl = '[[{{linkRef}}]]';
        let expected = 'link';
        ctx.templates = {linkRef: 'link'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('template with positional var inside link', function(done) {
        let tmpl = '[[{{linkPos|in}}]]';
        let expected = 'link';
        ctx.templates = {linkPos: 'l{{{1}}}k'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

    it('template with named var inside link', function(done) {
        let tmpl = '[[{{linkPos|var1=in}}]]';
        let expected = 'link';
        ctx.templates = {linkPos: 'l{{{var1}}}k'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|undefined'], visitor.history);

        done();
    });

});

describe('Link tests with display text', function() {

    beforeEach((done) => {
        visitor = new TrackingVisitor();
        ctx = {
            visitors: [visitor]
        };
        done();
    });

    it('only link', function(done) {
        let tmpl = '[[link|text]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('link before text', function(done) {
        let tmpl = '[[link|text]] abc';
        let expected = 'link abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('link after text', function(done) {
        let tmpl = 'abc [[link|text]]';
        let expected = 'abc link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('double nested link', function(done) {
        let tmpl = '[[[[link|text1]]|text2]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual([
            'LINK|link|text1',
            'LINK|link|text2'
        ], visitor.history);

        done();
    });

    it('opening tag before link', function(done) {
        let tmpl = '[[ [[link|text]]';
        let expected = '[[ link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('closing tag before link', function(done) {
        let tmpl = ']] [[link|text]]';
        let expected = ']] link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('opening tag after link', function(done) {
        let tmpl = '[[link|text]] [[ ';
        let expected = 'link [[ ';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('closing tag after link', function(done) {
        let tmpl = '[[link|text]] ]]';
        let expected = 'link ]]';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('single open bracket within a link', function(done) {
        let tmpl = '[[link|te[xt]] abc';
        let expected = 'link abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|te[xt'], visitor.history);

        done();
    });

    it('single close bracket within a link', function(done) {
        let tmpl = '[[link|te]xt]] abc';
        let expected = 'link abc';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|te]xt'], visitor.history);

        done();
    });

    it('trim spaces for link value', function(done) {
        let tmpl = '[[  link | text  ]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('trim whitespace for link value', function(done) {
        let tmpl = '[[\n\t   \rlink\r\n  \t|   \r\n\ttext \r\t\n  ]]';
        let expected = 'link';
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('positional variable inside text', function(done) {
        let tmpl = '[[link|{{{1}}}]]';
        let expected = 'link';
        ctx.posArgs = ['text'];
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('named variable inside text', function(done) {
        let tmpl = '[[link|{{{var1}}}]]';
        let expected = 'link';
        ctx.namedArgs = { var1: 'text'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('template inside text', function(done) {
        let tmpl = '[[link|{{textRef}}]]';
        let expected = 'link';
        ctx.templates = {textRef: 'text'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('template with positional var inside link', function(done) {
        let tmpl = '[[link|{{textPos|ex}}]]';
        let expected = 'link';
        ctx.templates = {textPos: 't{{{1}}}t'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

    it('template with named var inside link', function(done) {
        let tmpl = '[[link|{{textNamed|var1=ex}}]]';
        let expected = 'link';
        ctx.templates = {textNamed: 't{{{var1}}}t'};
        let actual = render(tmpl, ctx);
        should.strictEqual(expected, actual);
        should.deepEqual(['LINK|link|text'], visitor.history);

        done();
    });

});
