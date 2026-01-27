import { Component, OnInit } from '@angular/core';
import { RestClientService } from 'src/app/services/rest-client.service';
import { SettingsService } from 'src/app/services/settings.service';
import { IRawNode, IRawNodeStatusCount } from 'src/app/Models/RawDataTypes';
import { ListSettings, ListColumnSetting, ListColumnSettingWithFilter, ListColumnSettingForBadge } from 'src/app/Models/ListSettings';
import { ListColumnSettingWithExpandableLink } from '../expandable-link/expandable-link.component';
import { ListColumnSettingForExpandedDetails } from '../replica-details/replica-details.component';
import { IDashboardViewModel, DashboardViewModel } from 'src/app/ViewModels/DashboardViewModels';
import { IEssentialListItem } from 'src/app/modules/charts/essential-health-tile/essential-health-tile.component';

interface NodeDisplay {
  name: string;
  raw: IRawNode;
  nodeStatusBadge: { text: string; badgeClass: string };
  nodeStatus: string;
  isClickable: boolean;
  isSecondRowCollapsed: boolean;
  deployedReplicas: any[];
  deployedReplicasInfo?: string;
}

@Component({
  selector: 'app-nodes',
  templateUrl: './nodes.component.html',
  styleUrls: ['./nodes.component.scss']
})
export class NodesComponent implements OnInit {
  nodes: NodeDisplay[] = [];
  seedNodes: NodeDisplay[] = [];
  nonSeedNodes: NodeDisplay[] = [];
  listSettings!: ListSettings;
  seedNodeCount = 0;
  faultDomainCount = 0;
  upgradeDomainCount = 0;
  uniqueCodeVersions: string[] = [];
  tiles: IDashboardViewModel[] = [];
  essentialItems: IEssentialListItem[] = [];
  isLoading = true;

  constructor(
    private restClient: RestClientService,
    private settings: SettingsService
  ) {}

  ngOnInit(): void {
    this.setupListSettings();
    this.loadNodes();
  }

  setupListSettings(): void {
    const clickHandler = this.handleNodeClick.bind(this);
    
    const columnSettings = [
      new ListColumnSettingWithExpandableLink('name', 'Name', clickHandler, undefined, undefined, false, 'nodeStatus', true),
      new ListColumnSetting('raw.IpAddressOrFQDN', 'Address'),
      new ListColumnSettingWithFilter('raw.Type', 'Node Type'),
      new ListColumnSettingWithFilter('raw.UpgradeDomain', 'Upgrade Domain'),
      new ListColumnSettingWithFilter('raw.FaultDomain', 'Fault Domain'),
      new ListColumnSettingWithFilter('raw.IsSeedNode', 'Is Seed Node'),
      new ListColumnSettingForBadge('nodeStatusBadge', 'Status'),
      new ListColumnSettingWithFilter('raw.Id.Id', 'Node Id'),
      new ListColumnSettingWithFilter('raw.CodeVersion', 'Code Version'),
    ];

    const secondRowColumnSettings = [
      new ListColumnSetting('deployedReplicasInfo', 'Deployed System Replicas', { colspan: -1 })
    ];

    this.listSettings = new ListSettings(
      15,
      null,
      'nodes',
      columnSettings,
      secondRowColumnSettings,
      true,
      (item) => item.isClickable && item.deployedReplicas.length > 0,
      true,  // searchable
      false  // showRowExpander
    );
  }

  loadNodes(): void {
    this.isLoading = true;
    this.restClient.getNodes().subscribe({
      next: (rawNodes: IRawNode[]) => {
        this.nodes = rawNodes.map(rawNode => ({
          name: rawNode.Name,
          raw: rawNode,
          nodeStatus: rawNode.NodeStatus || 'Unknown',
          nodeStatusBadge: this.getNodeStatusBadge(rawNode.NodeStatus || 'Unknown'),
          isClickable: true,
          isSecondRowCollapsed: true,
          deployedReplicas: [],
          deployedReplicasInfo: ''
        }));

        this.seedNodes = this.nodes.filter(node => node.raw.IsSeedNode === true);
        this.nonSeedNodes = this.nodes.filter(node => node.raw.IsSeedNode === false);
        this.seedNodeCount = this.seedNodes.length;
        this.faultDomainCount = new Set(rawNodes.map(node => node.FaultDomain)).size;
        this.upgradeDomainCount = new Set(rawNodes.map(node => node.UpgradeDomain)).size;
        this.uniqueCodeVersions = [...new Set(rawNodes.map(node => node.CodeVersion))];

        this.updateItemInEssentials();
        this.updateTiles();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getNodeStatusBadge(nodeStatus: string): { text: string; badgeClass: string } {
    switch (nodeStatus) {
      case 'Up':
        return { text: nodeStatus, badgeClass: 'badge-ok' };
      case 'Down':
        return { text: 'Down', badgeClass: 'badge-error' };
      case 'Disabling':
      case 'Disabled':
        return { text: nodeStatus, badgeClass: 'badge-warning' };
      default:
        return { text: nodeStatus, badgeClass: 'badge-unknown' };
    }
  }

  updateTiles(): void {
    const nodeStatusCount: IRawNodeStatusCount = {
      UpCount: this.nodes.filter(node => node.nodeStatus === 'Up').length,
      DisabledCount: this.nodes.filter(node => node.nodeStatus === 'Disabled' || node.nodeStatus === 'Disabling').length,
      DownCount: this.nodes.filter(node => node.nodeStatus === 'Down').length
    };

    this.tiles = [
      DashboardViewModel.fromNodeStatusCount('Nodes', 'Node', false, nodeStatusCount)
    ];
  }

  updateItemInEssentials(): void {
    this.essentialItems = [
      {
        descriptionName: 'Code Version',
        copyTextValue: this.uniqueCodeVersions.toString(),
        displayText: this.uniqueCodeVersions.toString(),
      },
      {
        descriptionName: 'Fault Domains',
        displayText: this.faultDomainCount.toString(),
        copyTextValue: this.faultDomainCount.toString()
      },
      {
        descriptionName: 'Upgrade Domains',
        displayText: this.upgradeDomainCount.toString(),
        copyTextValue: this.upgradeDomainCount.toString()
      },
      {
        descriptionName: 'Seed Nodes',
        displayText: this.seedNodeCount.toString(),
        copyTextValue: this.seedNodeCount.toString()
      }
    ];
  }

  private handleNodeClick(node: NodeDisplay): void {
    if (!node.isClickable) {
      return;
    }
    
    node.isSecondRowCollapsed = !node.isSecondRowCollapsed;
    
    if (!node.isSecondRowCollapsed && node.deployedReplicas.length === 0) {
      this.loadDeployedReplicasForNode(node);
    }
  }

  private loadDeployedReplicasForNode(node: NodeDisplay): void {
    this.restClient.getDeployedReplicasByApplication(node.name, 'System').subscribe({
      next: (replicas: any[]) => {
        node.deployedReplicas = replicas;
        
        const primaryCount = replicas.filter(r => r.ReplicaRole === 'Primary').length;
        const activeSecondaryCount = replicas.filter(r => r.ReplicaRole === 'ActiveSecondary').length;
        const idleSecondaryCount = replicas.filter(r => r.ReplicaRole === 'IdleSecondary').length;
        
        node.deployedReplicasInfo = `Primary: ${primaryCount}, ActiveSecondary: ${activeSecondaryCount}, IdleSecondary: ${idleSecondaryCount}`;
      },
      error: (err) => {
        console.error(`Error fetching replicas for node ${node.name}:`, err);
        node.deployedReplicasInfo = 'Error loading replicas';
      }
    });
  }

  private onNodeNameClick(node: NodeDisplay): void {
    this.restClient.getDeployedReplicasByApplication(node.name, 'System').subscribe({
      next: (replicas: any[]) => {
        const replicaCount = replicas.length;
        console.log(`Node ${node.name} has ${replicaCount} deployed replicas`);
        alert(`Node ${node.name} has ${replicaCount} deployed replicas`);
      },
      error: (err) => {
        console.error(`Error fetching replicas for node ${node.name}:`, err);
      }
    });
  }
}