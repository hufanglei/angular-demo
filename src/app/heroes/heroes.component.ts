import {Component, OnInit} from '@angular/core';
import {Hero} from '../hero';
import {HeroService} from '../hero.service';

//@Component 是个装饰器函数，用于为该组件指定 Angular 所需的元数据。
@Component({
  selector: 'app-heroes', //组件的选择器（CSS 元素选择器） app-heroes 用来在父组件的模板中匹配 HTML 元素的名称，以识别出该组件。
  templateUrl: './heroes.component.html', //组件模板文件的位置
  styleUrls: ['./heroes.component.css'] //组件私有 CSS 样式表文件的位置
})
//始终要 export 这个组件类，以便在其它地方（比如 AppModule）导入它。
export class HeroesComponent implements OnInit {

  heroes: Hero[];

  //这个参数同时做了两件事：1. 声明了一个私有 heroService 属性，2. 把它标记为一个 HeroService 的注入点。
  //当 Angular 创建 HeroesComponent 时，依赖注入系统就会把这个 heroService 参数设置为 HeroService 的单例对象。
  constructor(private heroService: HeroService) { }

  // 是一个生命周期钩子，Angular 在创建完组件后很快就会调用 ngOnInit。这里是放置初始化逻辑的好地方。
  ngOnInit() {
    this.getHeroes();
  }

 /*
  HeroService 必须等服务器给出响应， 而 getHeroes() 不能立即返回英雄数据， 浏览器也不会在该服务等待期间停止响应。
  HeroService.getHeroes() 必须具有某种形式的异步函数签名。
  它可以使用回调函数，可以返回 Promise（承诺），也可以返回 Observable（可观察对象）。
  这节课，HeroService.getHeroes() 将会返回 Observable，因为它最终会使用 Angular 的 HttpClient.get 方法来获取英雄数据，而 HttpClient.get() 会返回 Observable。
   Observable 是 RxJS 库中的一个关键类。
  */
  getHeroes(): void {
    // Observable.subscribe() 是关键的差异点。
    // 新的版本等待 Observable 发出这个英雄数组，这可能立即发生，也可能会在几分钟之后。
    // 然后，subscribe 函数把这个英雄数组传给这个回调函数，该函数把英雄数组赋值给组件的 heroes 属性。
    // 使用这种异步方式，当 HeroService 从远端服务器获取英雄数据时，就可以工作了。
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        this.heroes.push(hero);
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero).subscribe();
  }



}
