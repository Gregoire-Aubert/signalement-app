import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsableTextComponent } from './collapsable-text.component';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { Angulartics2RouterlessModule } from 'angulartics2/routerlessmodule';

describe('CollapsableTextComponent', () => {
  let component: CollapsableTextComponent;
  let fixture: ComponentFixture<CollapsableTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CollapsableTextComponent,
        TruncatePipe,
      ],
      imports: [
        Angulartics2RouterlessModule.forRoot(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsableTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
