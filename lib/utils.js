const parseBabel = require('@babel/parser')
const traverse = require('@babel/traverse')
const { transformFromAst } = require('@babel/core')

function parse (sourceCode) {
    const dependencies = []
    // 转换为抽象语法树 , 用于解析esm模块
    const ast = parseBabel.parse(sourceCode, {
        sourceType: 'module'
    })
    //  遍历抽象语法树 ，获取依赖的路径。对于import来说路径为value值，对于require来说则为argument[0].value
    traverse.default(ast, {
        ImportDeclaration ({ node }) {
            dependencies.push(node.source.value)
        },
        CallExpression ({ node }) {
            if (node.callee.name === 'require') {
                dependencies.push(node.arguments[0].value)
            }
        }
    })
    //  根据抽象语法树将es6+代码转化为es5，同时require转化为import
    const { code } = transformFromAst(ast, null, {
        presets: ['env']
    })
    return {
        code,
        dependencies
    }
}


module.exports = {
    parse
}