import * as Enums from './enums';
import * as KrixStateStore from '@krix/state-store';

export interface OnInit {
  onInit(): void;
}

export interface InitDeps {
  initDeps(): void;
}

export interface EndpointMessage extends BridgeMessage {
  tabId: number;
  endpoint: Enums.AppEndpoint;
}

export interface BridgeMessage <PayloadType = any> {
  command: Enums.MsgCommands;
  payload?: PayloadType;
}

export type PackageType = KrixStateStore.StateStore;
export type PackageCommand = KrixStateStore.Interfaces.StoreCommand;

export interface PackageMessage  {
  packageName: Enums.PackageName;
  storeName: string;
  command: PackageCommand;
}
