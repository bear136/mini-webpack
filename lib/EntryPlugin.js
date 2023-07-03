const path = require('path')

class EntryPlugin {
    constructor({ entry }) {
        this.entry = entry
    }

    apply (compiler) {
        compiler.hooks.make.tapAsync('EntryPlugin', (compilation, callback) => {
            const moduleQueue = []
            const visitedAsset = {}

            const entryModule = compilation.buildModule(this.entry)
            moduleQueue.push(entryModule)
            // 对依赖进行递归构建
            for (let i = 0; i < moduleQueue.length; i++) {
                const module = moduleQueue[i]

                module.dependencies.forEach(dependency => {
                    // 转换成绝对路径 
                    const childDependency = path.resolve(path.dirname(this.entry), dependency)
                    // 如果已经有构建过的module，则不用二次构建，直接查询到后使用
                    if (visitedAsset[childDependency]) {
                        const sameModule = moduleQueue.find((item) => item.filename === childDependency)
                        module.mapping[dependency] = sameModule.id 
                    } else {
                        const childModule = compilation.buildModule(childDependency)
                        module.mapping[dependency] = childModule.id
                        visitedAsset[childDependency] = childModule.id
                        moduleQueue.push(childModule)
                    }
                })
            }

            compilation.graph = moduleQueue

            callback()
        })
    }
}

module.exports = EntryPlugin