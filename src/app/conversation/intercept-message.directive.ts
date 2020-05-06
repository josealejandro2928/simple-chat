import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[interceptMessage]',
})
export class InterceptMessageDirective {
  private observer: IntersectionObserver;
  @Output() public interceptMessage: EventEmitter<any> = new EventEmitter();

  constructor(private _element: ElementRef) {}

  public ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => {
        this.checkForIntersection(entries);
      },
      { threshold: 0.5 }
    );
    this.observer.observe(<Element>this._element.nativeElement);
  }

  private checkForIntersection = (
    entries: Array<IntersectionObserverEntry>
  ) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (this.checkIfIntersecting(entry)) {
        this.interceptMessage.emit(this._element.nativeElement.id);
        this.observer.unobserve(<Element>this._element.nativeElement);
        this.observer.disconnect();
      }
    });
  };

  private checkIfIntersecting(entry: IntersectionObserverEntry) {
    return (<any>entry).isIntersecting;
  }
}
