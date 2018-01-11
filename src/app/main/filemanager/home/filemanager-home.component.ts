import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OFormComponent } from 'ontimize-web-ngx';

@Component({
  selector: 'filemanager-home',
  templateUrl: './filemanager-home.component.html',
  styleUrls: ['./filemanager-home.component.scss']
})
export class FilemanagerHomeComponent implements OnInit, AfterViewInit {

  @ViewChild('oForm') oForm: OFormComponent;

  constructor(
    private router: Router,
    private actRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.oForm._emitData({ 'USER_ID': 1 });
  }
}
