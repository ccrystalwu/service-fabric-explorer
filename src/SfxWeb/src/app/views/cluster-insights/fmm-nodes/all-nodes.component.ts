import { Component, OnInit } from '@angular/core';
import { RestClientService } from 'src/app/services/rest-client.service';
import { SettingsService } from '../../../services/settings.service';
import { ListSettings, ListColumnSettingForLink, ListColumnSetting, ListColumnSettingWithFilter, ListColumnSettingForBadge } from '../../../Models/ListSettings';
import { IRawNode } from '../../../Models/RawDataTypes';

// Simple interface for FMM Node display
interface FMMNodeDisplay {
  raw: IRawNode;
}

@Component({
  selector: 'app-fmm-nodes',
  templateUrl: './all-nodes.component.html',
  styleUrls: ['./all-nodes.component.scss']
})
export class FMMNodesComponent implements OnInit {

  nodes: FMMNodeDisplay[] = [];
  listSettings: ListSettings | null = null;

  constructor(
    private restClient: RestClientService, 
    private settings: SettingsService
  ) { }

  ngOnInit() {
    console.log('FMMNodesComponent ngOnInit called');
    this.setupListSettings();
    console.log('List settings initialized:', this.listSettings);
    this.loadFMMNodes();
  }

  setupListSettings(): void {
    console.log('Setting up FMM nodes list settings');
    this.listSettings = this.settings.getNewOrExistingListSettings('fmm-nodes', ['name'], [
      new ListColumnSettingWithFilter('raw.Name', 'Name'),
      new ListColumnSetting('raw.IpAddressOrFQDN', 'Address'),
      new ListColumnSettingWithFilter('raw.Type', 'Node Type'),
      new ListColumnSettingWithFilter('raw.UpgradeDomain', 'Upgrade Domain'),
      new ListColumnSettingWithFilter('raw.FaultDomain', 'Fault Domain'),
      new ListColumnSettingWithFilter('raw.IsSeedNode', 'Is Seed Node'),
      new ListColumnSettingWithFilter('raw.NodeStatus', 'Status'),
      new ListColumnSettingWithFilter('raw.Id.Id', 'Node Id'),
      new ListColumnSettingWithFilter('raw.CodeVersion', 'Code Version'),
    ]);
  }

  loadFMMNodes(): void {    
    this.restClient.getFMMNodes().subscribe({
      next: (rawNodes: IRawNode[]) => {
        console.log('Fetched nodes:', rawNodes);
        this.nodes = rawNodes.map(rawNode => ({
          raw: rawNode,
        }));
        console.log('Processed nodes:', this.nodes);
      },
      error: (err) => {
        console.error('Error fetching FMM nodes:', err);
      }
    });
  }
}