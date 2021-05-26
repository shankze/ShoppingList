import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListClearComponent } from './list-clear.component';

describe('ListClearComponent', () => {
  let component: ListClearComponent;
  let fixture: ComponentFixture<ListClearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListClearComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListClearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
