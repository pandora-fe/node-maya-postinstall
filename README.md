# 初始化

```js
const { PostInstall } = require('node-maya-postinstall')

const postInstall = new PostInstall()
```

# 创建文件

```js
postInstall.write(fileName, content)
```

# 更新 package.json 的 scripts

```js
postInstall.updatePackageScripts(key, content)
```

# 更新 package.json 的依赖包

```js
postInstall.updatePackageDependencies(type, key, content) // type: 1: dependencies 2: devDependencies
```

# 删除文件

```js
postInstall.remove(fileName)
```
