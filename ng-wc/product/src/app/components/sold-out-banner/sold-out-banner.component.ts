import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CONSTANT_I18N } from '../../classes/i18n-constant';

@Component({
  selector: 'app-sold-out-banner',
  templateUrl: './sold-out-banner.component.html',
  styleUrls: ['./sold-out-banner.component.scss']
})
export class SoldOutBannerComponent implements OnInit {
  @Output() msgDismiss = new EventEmitter<void>();
  @Input() locale: string = 'enUS';
  public i18nLable = CONSTANT_I18N;
  constructor() { }

  ngOnInit(): void {
  }
  public emitEvent() {
    this.msgDismiss.emit();
  }
}
