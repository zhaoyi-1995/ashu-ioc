import { Parser } from "acorn"
import { simple } from "acorn-walk"
import CreateIoc from "./ioc"
import 'reflect-metadata'

interface IIndexService {
  log(str: string): void
}

class IndexService implements IIndexService {
  log(str: string) {
    console.log(str)
  }
}

const TYPES = {
  indexService: Symbol.for('indexService')
}
const container = new CreateIoc()
container.bind(TYPES.indexService, () => new IndexService)

function extractConstructorParams(classNode: Function) {
  const ast = Parser.parse(classNode.toString(), {
    ecmaVersion: 2022,
    sourceType: 'module'
  })
  const constructorParams: string[] = []
  simple(ast, {
    MethodDefinition(node) {
      if(node.kind === 'constructor') {
        node.value.params.forEach((param) => {
          if(param.type === 'Identifier') {
            constructorParams.push(param.name)
          } else if(param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
            constructorParams.push(param.left.name)
          }
        })
      }
    }
  })
  return constructorParams
}
function haskey <O extends Object>(obj: O, key: PropertyKey): key is keyof O {
  return obj.hasOwnProperty(key)
}
function inject(serviceIdentifier: symbol) {
  return (target: Object, targetKey: string | undefined, index: number) => {
    if(!targetKey) {
      Reflect.defineMetadata(serviceIdentifier, container.get(serviceIdentifier), target)
    }
  }
}

function controller <T extends {new (...arg: any[]): {}}>(constructor: T) {
  return class extends constructor {
    constructor(...arg: any[]) {
      // 将传入的constructor 获取到, 编译成ast
      const _params = extractConstructorParams(constructor)
      super(...arg)
      let identity: string
      for(identity of _params) {
        if(haskey(this, identity)) {
          // this[identity] = container.get(TYPES[identity as keyof typeof TYPES])
          // 通过反射的形式去设定目标的代码
          this[identity] = Reflect.getMetadata(
            TYPES[identity as keyof typeof TYPES],
            constructor
          )
        }
        
      }

      //@ts-ignore 
      // this.indexService = new IndexService()
    }
  }
}

@controller
class IndexController {
  public indexService!: IndexService

  constructor(@inject(TYPES.indexService) indexService?: IndexService) {
    if(indexService) {
      this.indexService = indexService
    }
  }
  info() {
    this.indexService.log('阿树,这一生啊')
  }
}
const index = new IndexController()

index.info()