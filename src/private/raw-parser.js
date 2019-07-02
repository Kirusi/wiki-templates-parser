'use strict';
const ContextUtil = require('./context-util');
const Parser = require('jison').Parser;

let grammar = {
    'lex': {
        'startConditions': {'varExpr': 1, 'template': 2, 'link': 3},
        'macros': {
            'esc': '\\\\',
            'int': '[0-9]+',
        },
        // === LEXER RULES ===
        'rules': [
            // PLAIN TEXT RULES

            /* Anything but curly braces is accepted as is.
               Parentheses need special handling starting with Node 10*/
            [['INITIAL', 'varExpr', 'template', 'link'], '(?:[^\\{\\}\\|\\=\\[\\]]|\\n|[\\(\\)])+', 'return \'TEXT\';'],
            // double quotes are converted into single quotes
            [['INITIAL', 'varExpr'], '=', 'yytext=\'=\'; return \'TEXT\';'],
            [['INITIAL'], '\\|', 'yytext=\'\\|\'; return \'TEXT\';'],

            /* EXPRESSION RULES
               opening curly brace: switch to expression parsing mode */
            [['INITIAL', 'varExpr', 'template', 'link'], '\\{\\{\\{', 'this.begin(\'varExpr\'); return \'OPEN_VAR_TAG\';'],
            // closing curly brace: expression is complete. Switch back to plain text mode
            [['varExpr'], '\\}\\}\\}', 'this.popState(); return \'CLOSE_VAR_TAG\';'],
            [['varExpr', 'template', 'link'], '\\|', 'return \'PIPE\';'],

            /* TEMPLATE RULES
               opening curly brace: switch to template parsing mode */
            [['INITIAL', 'varExpr', 'template', 'link'], '\\{\\{', 'this.begin(\'template\'); return \'OPEN_TMPL_TAG\';'],
            // closing curly brace: template is complete. Switch back to plain text mode
            [['template'], '\\}\\}', 'this.popState(); return \'CLOSE_TMPL_TAG\';'],
            [['template'], '=', 'return \'ASSIGN\';'],

            /* LINK RULES
               opening bracket: switch to link parsing mode */
            [['INITIAL', 'link'], '\\[\\[', 'this.begin(\'link\'); yytext =\'\\[\\[\'; return \'OPEN_LINK_TAG\';'],
            // closing curly brace: template is complete. Switch back to plain text mode
            [['link'], '\\]\\]', 'this.popState(); yytext =\'\\]\\]\'; return \'CLOSE_LINK_TAG\';'],

            [['INITIAL', 'varExpr', 'template'], '\\{', 'yytext=\'\\{\'; return \'TEXT\';'],
            [['INITIAL', 'varExpr', 'template'], '\\}', 'yytext=\'\\}\'; return \'TEXT\';'],

            [['INITIAL', 'varExpr', 'template', 'link'], '\\[', 'yytext=\'\\[\'; return \'TEXT\';'],
            [['INITIAL', 'varExpr', 'template', 'link'], '\\]', 'yytext=\'\\]\'; return \'TEXT\';'],

            // End of parsed text
            [['INITIAL', 'link', ], '$', 'return \'EOF\';']
        ]
    },

    // === PARSER RULES ===
    'bnf': {
        'contents': [
            [ 'content EOF', '{ return $1; }' ],
            [ 'EOF', '{ return ""; }' ],
        ],
        'content': [
            // template starts with a variable value
            ['expr', '{ yy.util.logParser("CONTENT: expr \'" + $1 + "\'"); $$ = $1; }'],
            // template starts with another template
            ['template', '{ yy.util.logParser("CONTENT: template \'" + $1 + "\'"); $$ = $1; }'],
            // template starts with a link
            ['link', '{ yy.util.logParser("CONTENT: link \'" + $1 + "\'"); $$ = $1; }'],
            // append variable value to a template
            ['content expr', '{ yy.util.logParser("CONTENT: content expr \'" + $1 + "\' \'" + $2 + "\'"); $$ = $1 + $2; }'],
            // append template value to the current template
            ['content template', '{ yy.util.logParser("CONTENT: content template \'" + $1 + "\' \'" + $2 + "\'"); $$ = $1 + $2; }'],
            // append link to the current template
            ['content link', '{ yy.util.logParser("CONTENT: content link \'" + $1 + "\' \'" + $2 + "\'"); $$ = $1 + $2; }'],
            // template starts with text
            ['TEXT', '{ yy.util.logParser("CONTENT: TEXT \'" + $1 + "\'"); $$ = $1; }'],
            // append text to a template */
            ['content TEXT', '{ yy.util.logParser("CONTENT: content TEXT \'" + $1 + "\' \'" + $2 + "\'"); $$ = $1 + $2; }'],
        ],

        'expr': [
            [ 'OPEN_VAR_TAG content CLOSE_VAR_TAG', '{ yy.util.logParser("EXPR: no pipe"); $$= yy.util.lookupVar(yy.ctx, $2, false); }' ],
            [ 'OPEN_VAR_TAG content PIPE CLOSE_VAR_TAG', '{ yy.util.logParser("EXPR: with pipe"); $$= yy.util.lookupVar(yy.ctx, $2, true); }' ],
            [ 'OPEN_VAR_TAG CLOSE_VAR_TAG', '{ yy.util.logParser("EXPR: empty"); $$= "{{{}}}"; }' ],
            [ 'OPEN_VAR_TAG PIPE CLOSE_VAR_TAG', '{ yy.util.logParser("EXPR: empty with pipe"); $$= ""; }' ],
        ],

        'template': [
            [
                'OPEN_TMPL_TAG content CLOSE_TMPL_TAG',
                '{ yy.util.logParser("TMPL: regular"); $$= yy.util.parseTemplate(yy.newParserFunc, yy.util.createNewCtx(yy.ctx), $2); }'
            ],
            [
                'OPEN_TMPL_TAG content PIPE CLOSE_TMPL_TAG',
                '{ yy.util.logParser("TMPL: pipe");  $$= yy.util.parseTemplate(yy.newParserFunc, yy.util.createNewCtx(yy.ctx), $2); }'
            ],
            [
                'OPEN_TMPL_TAG content parameters CLOSE_TMPL_TAG',
                '{ yy.util.logParser("TMPL: params"); $$= yy.util.parseTemplate(yy.newParserFunc, yy.util.createNewCtx(yy.ctx), $2); }'
            ],
            [
                'OPEN_TMPL_TAG content parameters PIPE CLOSE_TMPL_TAG',
                '{ yy.util.logParser("TMPL: params and pipe"); $$= yy.util.parseTemplate(yy.newParserFunc, yy.util.createNewCtx(yy.ctx), $2); }'
            ],
            [ 'OPEN_TMPL_TAG CLOSE_TMPL_TAG', '{ yy.util.logParser("TMPL: regular"); $$= "{{}}"; }' ],
            [ 'OPEN_TMPL_TAG PIPE CLOSE_TMPL_TAG', '{ yy.util.logParser("TMPL: regular"); $$= "{{}}"; }' ],
        ],

        'parameters': [
            ['parameter', '{ yy.util.logParser("PARAMETERS start"); }'],
            ['parameters parameter', '{ yy.util.logParser("PARAMETERS add"); }'],
        ],

        'parameter': [
            [
                'PIPE content',
                // eslint-disable-next-line max-len
                '{ yy.util.logParser("PARAM: non-named \'" + $2 + "\'"); if (! yy.ctx.numberedParams) { yy.ctx.numberedParams = []; } yy.ctx.numberedParams.push($2); }'
            ],
            [
                'PIPE content ASSIGN content',
                // eslint-disable-next-line max-len
                '{ yy.util.logParser("PARAM: named \'" + $2 + "\'=\'" + $4 + "\'"); if (! yy.ctx.namedParams) { yy.ctx.namedParams = {}; } yy.ctx.namedParams[$2]=$4; }'
            ],
        ],

        'link': [
            // regular link
            ['OPEN_LINK_TAG content CLOSE_LINK_TAG', '{ yy.util.logParser("LINK: content"); let res = yy.util.processLink(yy.ctx, $2); $$ = res; }'],
            // link with display text
            // eslint-disable-next-line max-len
            ['OPEN_LINK_TAG content PIPE content CLOSE_LINK_TAG', '{ yy.util.logParser("LINK: display text"); let res = yy.util.processLink(yy.ctx, $2, $4); $$ = res; }'],
            // broken link; missing closing tag
            ['OPEN_LINK_TAG content', '{ yy.util.logParser("LINK: content missing close"); $$ = $1 + $2; }'],
            // link with display text; missing closing tag
            ['OPEN_LINK_TAG content PIPE content', '{ yy.util.logParser("LINK: content"); $$ = $1 + $2 + $3 + $4; }'],
        ],

        /*
        'expr': [
            // variable name
            ['ID', '{ yy.stack=yy.ctx[0][$1]; }'],
            // array index
            ['expr [ NUMBER ]', '{ let argPos = parseInt($3, 10); yy.stack=yy.stack[argPos]; }'],
            // object field
            ['expr . ID', '{ yy.stack=yy.stack[$3]; }'],
            // irregular field name enclosed in quotes
            ['expr [ QUOTE identifier QUOTE ]', '{ yy.stack=yy.stack[$4]; }'],
            ['expr [ QUOTE QUOTE ]', '{ yy.stack=yy.stack[""]; }'] //empty identifier
        ]
        */
    }
};

/* using a global parser instance
   Instantiation of parser is quite heavy and requires a significant amount of RAM
   This is very different for generated parser code. */
let parser = new Parser(grammar);

/**
 * Parser class uses the grammar defintion above.
 * It can be used for testing, but one must use the generated parser code for production purposes
 */
class RawParser {
    /**
     * Render template using Parser library
     * @param {*} template - string with positional or named parameters enclosed in curly braces
     * @param  {...any} args - either multiple values when using positional parameters,
     *                         or a single objects with names of the fields corresponding to the names used in the template
     */
    static render(template, ctx) {
        parser.yy.ctx = ctx;
        parser.yy.util = new ContextUtil();
        parser.yy.newParserFunc = function newParserFunc() {
            return parser;
        };
        let result = parser.parse(template);
        return result;
    }

    /**
     * Generate source code for a standalone parser
     */
    /* istanbul ignore next */
    static generateCode() {
        let parserSource = parser.generate();
        return parserSource;
    }
}

module.exports = RawParser;