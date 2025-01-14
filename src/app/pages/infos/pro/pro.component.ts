import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import pages from '../../../../assets/data/pages.json';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pro',
  templateUrl: './pro.component.html',
  styleUrls: ['./pro.component.scss']
})
export class ProComponent implements OnInit {

  constructor(private titleService: Title,
              private meta: Meta,
              private router: Router) { }

  ngOnInit() {
    this.titleService.setTitle(pages.pro.title);
    this.meta.updateTag({ name: 'description', content: pages.pro.description });
  }

}
