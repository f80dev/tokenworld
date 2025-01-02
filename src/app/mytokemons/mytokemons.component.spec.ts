import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MytokemonsComponent } from './mytokemons.component';

describe('MytokemonsComponent', () => {
  let component: MytokemonsComponent;
  let fixture: ComponentFixture<MytokemonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MytokemonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MytokemonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
