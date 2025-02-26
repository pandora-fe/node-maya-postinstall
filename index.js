const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

class PostInstall {
  constructor(root) {
    this.root = root || path.join(process.cwd(), '/../..')
    console.info(`postInstall根目录为:${this.root}`)
    this.package = path.join(this.root, 'package.json')
    if (!fs.existsSync(this.package)) {
      console.error('目录错误')
    }
  }

  mayaInitStall() {
    if (!fs.existsSync(this.package)) return
    const mainPath = path.join(this.root, '/src/main.ts')
    if (!fs.existsSync(mainPath)) {
      const interceptorPath = path.join(
        this.root,
        '/src/interceptor/transform.interceptor.ts'
      )
      if (!fs.existsSync(interceptorPath)) {
        fse.ensureFileSync(interceptorPath)
        fs.writeFileSync(
          interceptorPath,
          `import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Response<T>>> {
        return next.handle().pipe(
            map((data) => ({
                result: true,
                data: data || {},
                time: new Date(),
            }))
        );
    }
}
`
        )
      }
      fse.ensureFileSync(mainPath)
      fs.writeFileSync(
        mainPath,
        `import { MayaServer } from 'node-maya';
import * as path from 'path';
import { get } from 'node-maya';

MayaServer.init({
    static: {
        pages: ['index.html'],
        prefix: '',
    },
    public: path.join(__dirname, '../public'),
    interceptor: path.join(__dirname, 'interceptor'),
    middle: path.join(__dirname, 'middleware'),
}).then((app) => {
    app.listen(get('port'), () => {
        // eslint-disable-next-line
        console.log('server start');
    });
});
`
      )
    }
    const configPath = path.join(this.root, '/config/default.js')
    if (!fs.existsSync(configPath)) {
      fse.ensureFileSync(configPath)
      fs.writeFileSync(
        configPath,
        `module.exports = {
    port: 3000,
    cdn: process.env.CDN,
    backendList: {
        '*': {
            target: process.env.TARGET,
            pathRewrite(path) {
                return path.replace('', '');
            },
        },
    },
};      
`
      )
    }
    const localDevPath = path.join(this.root, '/config/localDev.js')
    if (!fs.existsSync(localDevPath)) {
      fse.ensureFileSync(localDevPath)
      fs.writeFileSync(
        localDevPath,
        `module.exports = {
    port: 3000,
    cdn: '',
    backendList: {
        '*': {
            target: '',
            pathRewrite(path) {
                return path.replace('', '');
            },
        },
    },
};
`
      )
    }
  }

  /**
   * copy文件
   * @param {*} file
   * @returns
   */
  copy(file) {
    if (!fs.existsSync(this.package)) return
    const filePath = path.join(this.root, file)
    fse.copySync(file, filePath)
  }

  /**
   * 写入文件
   * @param {*} fileName 文件名
   * @param {*} content 文件内容
   * @returns
   */
  write(fileName, content) {
    if (!fs.existsSync(this.package)) return
    const filePath = path.join(this.root, fileName)
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  /**
   * 更新package.json的scripts
   * @param {*} key
   * @param {*} content 内容
   * @returns
   */
  updatePackageScripts(key, content) {
    if (!fs.existsSync(this.package)) return
    const packageData = JSON.parse(fs.readFileSync(this.package, 'utf-8'))
    if (key === 'start:k8s' && packageData.scripts['start:k8s']) return
    packageData.scripts[key] = content
    fs.writeFileSync(
      this.package,
      JSON.stringify(packageData, null, 2),
      'utf-8'
    )
  }

  /**
   * 更新package.json的依赖包
   * @param {*} type 1: dependencies 2: devDependencies
   * @param {*} key
   * @param {*} content
   */
  updatePackageDependencies(type, key, content) {
    if (!fs.existsSync(this.package)) return
    const packageData = JSON.parse(fs.readFileSync(this.package, 'utf-8'))
    packageData[type === 1 ? 'dependencies' : 'devDependencies'][key] = content
    fs.writeFileSync(
      this.package,
      JSON.stringify(packageData, null, 2),
      'utf-8'
    )
  }

  /**
   * 删除文件
   * @param {*} fileName 文件名
   * @returns
   */
  remove(fileName) {
    if (!fs.existsSync(this.package)) return
    const filePath = path.join(this.root, fileName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

module.exports.PostInstall = PostInstall
