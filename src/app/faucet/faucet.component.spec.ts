import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaucetComponent } from './faucet.component';

describe('FaucetComponent', () => {
  let component: FaucetComponent;
  let fixture: ComponentFixture<FaucetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaucetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaucetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
