import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorHandlerComponent } from './editor-handler.component';

describe('EditorHandlerComponent', () => {
  let component: EditorHandlerComponent;
  let fixture: ComponentFixture<EditorHandlerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditorHandlerComponent]
    });
    fixture = TestBed.createComponent(EditorHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
