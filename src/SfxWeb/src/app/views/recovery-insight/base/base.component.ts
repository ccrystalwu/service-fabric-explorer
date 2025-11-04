import { Component, ElementRef, Injector } from '@angular/core';
import { RecoveryInsightBaseControllerDirective } from '../RecoveryInsightBase';
import { DataService } from 'src/app/services/data.service';
import { TreeService } from 'src/app/services/tree.service';
import { IdGenerator } from 'src/app/Utils/IdGenerator';
import { IBaseView } from '../../BaseView';

@Component({
  selector: 'app-cluster-recovery-insight-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})

export class BaseComponent extends RecoveryInsightBaseControllerDirective implements IBaseView {
  tabs = [
    { name: 'Overview', route: './' }
  ];

  constructor(protected data: DataService, injector: Injector, private tree: TreeService, public el: ElementRef) {
      super(data, injector);
  }

  setup(): void {
    this.tree.selectTreeNode([
      IdGenerator.cluster(),
      IdGenerator.recoveryInsight()
    ]);
  }
}