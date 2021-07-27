import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOption2Component } from './search-option2.component';

describe('SearchOption2Component', () => {
  let component: SearchOption2Component;
  let fixture: ComponentFixture<SearchOption2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchOption2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOption2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
