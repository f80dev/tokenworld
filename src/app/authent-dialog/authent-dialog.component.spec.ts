import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthentDialogComponent } from './authent-dialog.component';

describe('AuthentDialogComponent', () => {
  let component: AuthentDialogComponent;
  let fixture: ComponentFixture<AuthentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
