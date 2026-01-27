import { Component, OnInit } from '@angular/core';
import { DetailBaseComponent } from 'src/app/ViewModels/detail-table-base.component';
import { ListColumnSetting } from 'src/app/Models/ListSettings';
import { NodeStatus } from 'src/app/Models/RawDataTypes';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-expandable-link',
  templateUrl: './expandable-link.component.html',
  styleUrls: ['./expandable-link.component.scss']
})
export class ExpandableLinkComponent implements DetailBaseComponent, OnInit {
  item: any;
  listSetting: any;

  displayText: string = '';
  infoMessage: string = '';
  color: string = 'var(--accent-lightblue)';
  showIcon: boolean = false;
  statusField?: string;
  showSeedNodeIndicator: boolean = false;
  assetBase = environment.assetBase;

  ngOnInit(): void {
    const setting = this.listSetting as ListColumnSettingWithExpandableLink;
    this.displayText = setting.displayText || this.listSetting.getValue(this.item) || '';
    this.infoMessage = setting.infoMessage || '';
    this.color = setting.color || 'var(--accent-lightblue)';
    this.showIcon = setting.showIcon || false;
    this.statusField = setting.statusField;
    this.showSeedNodeIndicator = setting.showSeedNodeIndicator || false;
  }

  getDisplayText(): string {
    return this.displayText || this.item?.id || '';
  }

  getColor(): string {
    if (this.statusField && this.item) {
      const status = this.item[this.statusField];
      return this.getColorForStatus(status);
    }
    return this.color;
  }

  private getColorForStatus(status: string): string {
    switch (status) {
      case 'Up':
        return 'var(--badge-ok)';
      case 'Down':
        return 'var(--badge-error)';
      case 'Disabling':
      case 'Disabled':
        return 'var(--badge-warning)';
      default:
        return this.color;
    }
  }

  isSeedNode(): boolean {
    return this.item?.raw?.IsSeedNode === true;
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
  infoMessage?: string;
  color?: string;
  showIcon?: boolean;
  statusField?: string;
  showSeedNodeIndicator?: boolean;
  
  constructor(propertyPath: string, displayName: string, clickHandler?: (item: any) => void, color?: string, infoMessage?: string, showIcon?: boolean, statusField?: string, showSeedNodeIndicator?: boolean) {
    super(propertyPath, displayName);
    this.clickHandler = clickHandler;
    this.color = color || 'var(--accent-lightblue)';
    this.infoMessage = infoMessage || '';
    this.showIcon = showIcon || false;
    this.statusField = statusField;
    this.showSeedNodeIndicator = showSeedNodeIndicator || false;
  }
}
