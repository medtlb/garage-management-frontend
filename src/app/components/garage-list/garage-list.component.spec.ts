import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageListComponent } from './garage-list.component';

describe('GarageListComponent', () => {
  let component: GarageListComponent;
  let fixture: ComponentFixture<GarageListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GarageListComponent]
    });
    fixture = TestBed.createComponent(GarageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
