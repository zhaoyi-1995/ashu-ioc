// interface IIndexService {
//   log(str: string): void
// }

// class IndexService implements IIndexService {
//   log(str: string) {
//     console.log(str)
//   }
// }

// class IndexController {
//   public indexService!: IndexService

//   constructor(indexService?: IndexService) {
//     if(indexService) {
//       this.indexService = indexService
//     }
//   }
//   info() {
//     this.indexService.log('阿树,这一生啊')
//   }
// }
// const service = new IndexService()
// const index = new IndexController(service)

// index.info()