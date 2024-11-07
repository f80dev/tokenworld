import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokemonComponent } from './tokemon.component';

describe('TokemonComponent', () => {
  let component: TokemonComponent;
  let fixture: ComponentFixture<TokemonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokemonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokemonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
