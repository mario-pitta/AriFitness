import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstrutorFormPage } from './instrutor-form.page';

describe('InstrutorFormPage', () => {
  let component: InstrutorFormPage;
  let fixture: ComponentFixture<InstrutorFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InstrutorFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
