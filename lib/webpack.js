const { Compiler } = require('./Compiler')

function webpack (config) {
    const compiler = new Compiler(config)
    compiler.run()
}

module.exports = {
    webpack
}