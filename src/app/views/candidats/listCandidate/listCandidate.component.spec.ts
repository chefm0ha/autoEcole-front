import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCandidateComponent } from './listCandidate.component';

describe('ListCandidateComponent', () => {
  let component: ListCandidateComponent;
  let fixture: ComponentFixture<ListCandidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCandidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
