import { Component, Input } from '@angular/core';
import { DetailBaseComponent } from 'src/app/ViewModels/detail-table-base.component';
import { ListColumnSetting } from 'src/app/Models/ListSettings';
import { NodeStatus } from 'src/app/Models/RawDataTypes';

@Component({
  selector: 'app-expandable-link',
  templateUrl: './expandable-link.component.html',
  styleUrls: ['./expandable-link.component.scss']
})
export class ExpandableLinkComponent implements DetailBaseComponent {
  item: any;
  listSetting: any;

  @Input() displayText: string = '';
  @Input() nodeStatusMessage: string = '';
  @Input() color: string = 'var(--accent-lightblue)';
  @Input() showIcon: boolean = false;

  getDisplayText(): string {
    return this.displayText || this.item?.id || '';
  }

  onClick(): void {
    if (this.listSetting?.clickHandler) {
      this.listSetting.clickHandler(this.item);
    }
  }
}

export class ListColumnSettingWithExpandableLink extends ListColumnSetting {
  template = ExpandableLinkComponent;
  clickHandler: (item: any) => void;
  displayText?: string;
  nodeStatusMessage?: string;
  color?: string;
  showIcon?: boolean;
  
  constructor(propertyPath: string, displayName: string, clickHandler?: (item: any) => void, color?: string, nodeStatusMessage?: string, showIcon?: boolean) {
    super(propertyPath, displayName);
    this.clickHandler = clickHandler;
    this.color = color || 'var(--accent-lightblue)';
    this.nodeStatusMessage = nodeStatusMessage || '';
    this.showIcon = showIcon || false;
  }
}
