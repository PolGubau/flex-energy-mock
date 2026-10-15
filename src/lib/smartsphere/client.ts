import { HttpCore, type SmartSphereClientConfig } from "./core";
import { AccountModule } from "./modules/account";
import { AuthModule } from "./modules/auth";
import { ContractModule } from "./modules/contract";
import { CustomersModule } from "./modules/customers";
import { FileManagerModule } from "./modules/file-manager";
import { FinancialModule } from "./modules/financial";
import { GasModule } from "./modules/gas";
import { GraphicsModule } from "./modules/graphics";
import { InfrastructureModule } from "./modules/infrastructure";
import { LanguageModule } from "./modules/language";
import { NotificationsModule } from "./modules/notifications";
import { ShopModule } from "./modules/shop";
import { StatisticsModule } from "./modules/statistics";
import { TariffsModule } from "./modules/tariffs";

// ─── Composed Client ───────────────────────────────────────────────────────────
export class SmartSphereApiClient {
  readonly auth: AuthModule;
  readonly account: AccountModule;
  readonly contract: ContractModule;
  readonly financial: FinancialModule;
  readonly graphics: GraphicsModule;
  readonly infrastructure: InfrastructureModule;
  readonly customers: CustomersModule;
  readonly language: LanguageModule;
  readonly notifications: NotificationsModule;
  readonly shop: ShopModule;
  readonly statistics: StatisticsModule;
  readonly tariffs: TariffsModule;
  readonly gas: GasModule;
  readonly fileManager: FileManagerModule;

  constructor(config: SmartSphereClientConfig) {
    const http = new HttpCore(config);
    this.auth = new AuthModule(http);
    this.account = new AccountModule(http);
    this.contract = new ContractModule(http);
    this.financial = new FinancialModule(http);
    this.graphics = new GraphicsModule(http);
    this.infrastructure = new InfrastructureModule(http);
    this.customers = new CustomersModule(http);
    this.language = new LanguageModule(http);
    this.notifications = new NotificationsModule(http);
    this.shop = new ShopModule(http);
    this.statistics = new StatisticsModule(http);
    this.tariffs = new TariffsModule(http);
    this.gas = new GasModule(http);
    this.fileManager = new FileManagerModule(http);
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

let _client = new SmartSphereApiClient({ baseUrl: BASE_URL });

/** Returns the current API client instance (always up to date with latest token). */
export function getClient(): SmartSphereApiClient {
  return _client;
}

/** Call this after login to inject the access token into all subsequent requests. */
export function setAuthToken(token: string): void {
  _client = new SmartSphereApiClient({ baseUrl: BASE_URL, accessToken: token });
}

/** Call this on logout to remove the access token. */
export function clearAuthToken(): void {
  _client = new SmartSphereApiClient({ baseUrl: BASE_URL });
}

/** The source ID for this SmartSphere instance (set via VITE_API_SOURCE_ID env var, defaults to 0). */
export const SOURCE_ID = Number(import.meta.env.VITE_API_SOURCE_ID ?? 0);
