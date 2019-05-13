import {Injectable} from '@angular/core';
import {Hero} from './hero';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
// @Injectable() 服务
//这个新的服务导入了 Angular 的 Injectable 符号，并且给这个服务类添加了 @Injectable() 装饰器
//@Injectable() 装饰器会接受该服务的元数据对象，就像 @Component() 对组件类的作用一样。

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  // 把服务器上英雄数据资源的访问地址 heroesURL 定义为 :base/:collectionName 的形式。
  // 这里的 base 是要请求的资源，而 collectionName 是 in-memory-data-service.ts 中的英雄数据对象。
  private heroesUrl = 'api/heroes';

  // 这是一个典型的“服务中的服务”场景： 你把 MessageService 注入到了 HeroService 中，而 HeroService 又被注入到了 HeroesComponent 中。
  constructor(private http: HttpClient, private messageService: MessageService) {
  }



  // 通过 HttpClient 获取英雄
  // 当前的 HeroService.getHeroes() 使用 RxJS 的 of() 函数来把模拟英雄数据返回为 Observable<Hero[]> 格式。
  //把该方法转换成使用 HttpClient 的
  getHeroes(): Observable<Hero[]> {
    // TODO: send the message _after_ fetching the heroes
    // this.messageService.add('HeroService: fetched heroes');
    // return of(HEROES); // of(HEROES) 会返回一个 Observable<Hero[]>，它会发出单个值，这个值就是这些模拟英雄的数组。
    // ，使用 .pipe() 方法来扩展 Observable 的结果，并给它一个 catchError() 操作符。
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        //使用 RxJS 的 tap 操作符来实现，该操作符会查看 Observable 中的值，使用那些值做一些事情，并且把它们传出来。 这种 tap 回调不会改变这些值本身。
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
    ;
  }

  // Http 方法返回单个值
  // 所有的 HttpClient 方法都会返回某个值的 RxJS Observable。
  // HTTP 是一个请求/响应式协议。你发起请求，它返回单个的响应。
  // 通常，Observable 可以在一段时间内返回多个值。 但来自 HttpClient 的 Observable 总是发出一个值，然后结束，再也不会发出其它值。
  // 具体到这次 HttpClient.get 调用，它返回一个 Observable<Hero[]>，顾名思义就是“一个英雄数组的可观察对象”。在实践中，它也只会返回一个英雄数组。
  getHero(id: number): Observable<Hero> {
    // TODO: send the message _after_ fetching the hero
    // this.messageService.add(`HeroService: fetched hero id=${id}`);
    // return of(HEROES.find(hero => hero.id === id));
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  //使用 http.put() 来把修改后的英雄保存到服务器上。
  // HttpClient.put() 方法接受三个参数
  // URL 地址
  // 要修改的数据（这里就是修改后的英雄）
  // 选项
  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** POST: add a new hero to the server */
  // HeroService.addHero() 和 updateHero 有两点不同。
  // 它调用 HttpClient.post() 而不是 put()。
  // 它期待服务器为这个新的英雄生成一个 id，然后把它通过 Observable<Hero> 返回给调用者。
  // 刷新浏览器，并添加一些英雄。
  addHero (hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  //当用户在搜索框中输入名字时，你会不断发送根据名字过滤英雄的 HTTP 请求。 你的目标是仅仅发出尽可能少的必要请求。
  //如果没有搜索词，该方法立即返回一个空数组。 剩下的部分和 getHeroes() 很像。 唯一的不同点是 URL，它包含了一个由搜索词组成的查询字符串。
  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }


  // 它不再直接处理这些错误，而是返回给 catchError 返回一个错误处理函数。还要用操作名和出错时要返回的安全值来对这个错误处理函数进行配置。
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /*
   getHeroes(): Hero[] {
     return HEROES;
   }*/
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }


}
