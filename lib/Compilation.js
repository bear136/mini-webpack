const fs = require('fs')
const { parse } = require('./utils')

let ID = 0
class Compilation {
    constructor(module, output) {
        this.loaders = module.loaders
        this.output = output
        this.graph = []
    }
    buildModule (filename) {
        let sourceCode = fs.readFileSync(filename, {
            encoding: 'utf-8'
        })
        if (Array.isArray(this.loaders)) {
            this.loaders.forEach((loader) => {
                const { test, use } = loader
                const loaderContext = {
                    addDeps (dep) {
                        console.log('addDeps', dep)
                    }
                }
                // loader遍历进行编译
                if (test.test(filename)) {
                    if (Array.isArray(use)) {
                        use.traverse().forEach(fn => {
                            sourceCode = fn.call(loaderContext, sourceCode)
                        })
                    } else {
                        sourceCode = fn.call(loaderContext, sourceCode)
                    }
                }
            })
        }

        const { code, dependencies } = parse(sourceCode)

        return {
            id: ID++,
            mapping: {},        // 模块引入路径与依赖id的映射
            dependencies,       //依赖的路径 
            filename,
            code                // 转换为es5的代码
        }
    }

}

module.exports = {
    Compilation
}


