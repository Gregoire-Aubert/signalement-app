import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDetailComponent } from './report-detail.component';
import { NgxLoadingModule } from 'ngx-loading';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoleDirective } from '../../../../directives/app-role.directive';
import { AppPermissionDirective } from '../../../../directives/app-permission.directive';
import { RouterTestingModule } from '@angular/router/testing';

describe('ReportDetailComponent', () => {
  let component: ReportDetailComponent;
  let fixture: ComponentFixture<ReportDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReportDetailComponent,
        AppRoleDirective,
        AppPermissionDirective
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgxLoadingModule,
        HttpClientModule,
        ModalModule.forRoot(),
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
