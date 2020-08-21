import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, Injector, DoBootstrap, ApplicationRef } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LazyImageComponent } from './components/lazy-image/lazy-image.component';
import { ProductBasicComponent } from './components/product-basic/product-basic.component';
import { SlideshowComponent } from './components/slideshow/slideshow.component';
import { SoldOutBannerComponent } from './components/sold-out-banner/sold-out-banner.component';
@NgModule({
  declarations: [
    SlideshowComponent,
    LazyImageComponent,
    ProductBasicComponent,
    SoldOutBannerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatRadioModule,
    MatButtonModule,
    BrowserAnimationsModule
  ],
  entryComponents: [ProductBasicComponent]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
    console.dir('ngDoBootstrap')
    const el = createCustomElement(ProductBasicComponent, { injector: this.injector });
    if (!customElements.get('mt-wc-product'))
      customElements.define('mt-wc-product', el);
  }
  ngDoBootstrap(appRef: ApplicationRef): void {
  }
}
