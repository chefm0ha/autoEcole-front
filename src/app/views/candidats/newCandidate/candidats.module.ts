import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidatsRoutingModule } from './candidats-routing.module';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CandidatsRoutingModule,
    HttpClientModule]
})
export class CandidatsModule { }
