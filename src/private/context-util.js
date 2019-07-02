'use strict';

let LOG_ENABLED = true;
let LOG_PARSER_ENABLED = true;
let LOG_LEXER_ENABLED = true;

class ContextUtil {
    lookupVar(ctx, varName, isOptional) {
        this.log(`lookupVar: "${varName}"`);
        let res = '';
        varName = `${varName}`.trim();
        if (varName.match(/^(\d)+$/)) {
            let argPos = parseInt(varName, 10);
            if (ctx.posArgs[argPos - 1] !== undefined) {
                res = ctx.posArgs[argPos - 1];
            }
            else {
                if (!isOptional) {
                    res = `{{{${varName}}}}`;
                }
            }
        }
        else {
            if ((ctx.namedArgs !== undefined) && (ctx.namedArgs[varName] !== undefined)) {
                res = ctx.namedArgs[varName];
            }
            else {
                if (!isOptional) {
                    res = `{{{${varName}}}}`;
                }
            }
        }
        return res;
    }

    parseTemplate(newParserFunc, ctx, templateName) {
        this.log(`parseTemplate: "${templateName}"`);
        templateName = `${templateName}`.trim();
        let res = '';
        if ((ctx.templates) && (ctx.templates[templateName] !== undefined)) {
            let parser = newParserFunc();
            parser.yy.ctx = ctx;
            parser.yy.util = new ContextUtil();
            parser.yy.newParserFunc = newParserFunc;
            this.log(`parseTemplate: source="${ctx.templates[templateName]}"`);
            res = parser.parse(ctx.templates[templateName]);
        }
        else {
            res = `{{${templateName}}}`;
        }
        return res;
    }

    processLink(ctx, link, displayText) {
        if (link) {
            link = link.trim();
        }
        if (displayText) {
            displayText = displayText.trim();
        }
        this.log(`processLink: "${link}" "${displayText}"`);
        let res = link;

        if (ctx && ctx.visitors) {
            for (let v of ctx.visitors) {
                v.visitLink(link, displayText);
            }
        }
        return res;
    }

    createNewCtx(ctx) {
        let newCtx = {};
        newCtx.templates = ctx.templates;
        newCtx.posArgs = ctx.numberedParams;
        newCtx.namedArgs = ctx.namedParams;
        delete ctx.numberedParams;
        delete ctx.namedParams;
        return newCtx;
    }

    /* istanbul ignore next */
    log(msg) {
        if (LOG_ENABLED) {
            // eslint-disable-next-line no-console
            console.log(msg);
        }
    }

    /* istanbul ignore next */
    logParser(msg) {
        if (LOG_PARSER_ENABLED) {
            // eslint-disable-next-line no-console
            console.log('PARSER: ' + msg);
        }
    }

    /* istanbul ignore next */
    logLexerParser(msg) {
        if (LOG_LEXER_ENABLED) {
            // eslint-disable-next-line no-console
            console.log('LEXER: ' + msg);
        }
    }
}

module.exports = ContextUtil;