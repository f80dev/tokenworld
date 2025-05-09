import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XportalSwitchComponent } from './xportal-switch.component';

describe('XportalSwitchComponent', () => {
  let component: XportalSwitchComponent;
  let fixture: ComponentFixture<XportalSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XportalSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XportalSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
