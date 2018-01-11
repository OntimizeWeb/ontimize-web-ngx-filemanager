import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { OFormComponent } from 'ontimize-web-ngx';

@Component({
  selector: 'testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit, AfterViewInit {

  @ViewChild('oForm') oForm: OFormComponent;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.oForm._emitData({ 'USER_ID': 1 });
  }

}
