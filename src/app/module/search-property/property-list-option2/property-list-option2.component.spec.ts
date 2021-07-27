import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyListOption2Component } from './property-list-option2.component';

describe('PropertyListOption2Component', () => {
  let component: PropertyListOption2Component;
  let fixture: ComponentFixture<PropertyListOption2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyListOption2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyListOption2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
