import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss']
})
export class SlideshowComponent implements OnInit {
  @Input() imageUrls: string[];
  @Input() imageSize: number;
  constructor() { }

  ngOnInit(): void {
  }

}
