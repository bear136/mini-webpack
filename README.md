# mini-webpack

#### 参考文档

https://juejin.cn/post/7210967900419948602#heading-7 


#### 所需依赖 

- tapable : webpack中的插件机制 

- @babel/parser: babel提供的JavaScript代码解析器，用于将js代码转化为ast 

- @babel/traverse: 遍历抽象语法树 

- @babel/core: 提供Babel编译器和API接口，将源代码转化为目标代码 

- @babel/preset-env: 根据配置的目标浏览器或者运行环境自动将ES6+转化为ES5

- ejs : 用于生成模板代码或读取模板文件