import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base/base.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RecoveryInsightRoutingModule } from './recovery-insight-routing.module';

@NgModule({
  declarations: [BaseComponent],
  imports: [
    CommonModule,
    RecoveryInsightRoutingModule,
    SharedModule
  ]
})
export class RecoveryInsightModule { }
