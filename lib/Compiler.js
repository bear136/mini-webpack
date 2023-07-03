const { AsyncSeriesHook, SyncHook, AsyncParallelHook } = require('tapable')
const { Compilation } = require('./Compilation')
const EntryPlugins = require('./EntryPlugin')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')

class Compiler {
    constructor(config) {
        const { entry, output, module, plugins } = config
        this.entry = entry
        this.output = output
        this.module = module
        this.plugins = plugins

        this.hooks = {
            compilation: new SyncHook(['compilation']),       //   同步钩子 
            make: new AsyncParallelHook(['compilation']),     //   异步并行钩子
            emit: new AsyncSeriesHook(['compilation']),       //   异步串行钩子 
            afterEmit: new AsyncSeriesHook(['compilation'])   //   异步串行钩子
        }
        this.initPlugins()
    }
    // 初始化插件 挂载插件
    run () {
        const compilation = new Compilation({
            module: this.module,
            output: this.output
        })

        this.hooks.compilation.call(compilation)

        this.hooks.make.callAsync(compilation, () => {
            console.log("make 钩子")
        })

        this.emitAssets(compilation)

        this.hooks.emit.callAsync(compilation, () => {
            console.log("emit 钩子")
        })
        this.hooks.afterEmit.callAsync(compilation, () => {
            console.log("afterEmit 钩子")
        })
    }
    //写文件
    emitAssets (compilation) {
        const fullpath = path.join(this.output.path, this.output.filename)
        const templatePath = path.resolve(__dirname, './template.ejs')

        const modules = compilation.graph.reduce((pre, cur) => {
            pre[cur.id] = {
                code: cur.code,
                mapping: cur.mapping
            }
            return pre
        }, {})

        const template = fs.readFileSync(templatePath, {
            encoding: 'utf-8'
        })

        const code = ejs.render(template, {
            data: modules
        })
        fs.writeFileSync(fullpath, code)
    }
    // 将所有的plugin中传入Compiler构造函数
    initPlugins () {
        const compiler = this

        if (Array.isArray(this.plugins)) {
            this.plugins.forEach(plugin => {
                if (typeof plugin === 'function') {
                    plugin.call(compiler, compiler)
                } else {
                    plugin.apply(compiler)
                }
            })
        }

        new EntryPlugins({
            entry: this.entry
        }).apply(compiler)

    }
}

module.exports = {
    Compiler
}