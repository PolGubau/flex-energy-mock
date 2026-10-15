import type {
  DateInput,
  HttpCore,
  Precision,
  SumMethod,
  TransactionStatus,
} from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface GraphicData {
  label?: string | null;
  value?: string | null;
}

export interface GraphicChart {
  subcaption?: string | null;
  yAxisName?: string | null;
  xAxisName?: string | null;
  caption?: string | null;
  theme?: string | null;
}

export interface GraphicSimple {
  data?: GraphicData[] | null;
  chart?: GraphicChart[] | null;
}

export interface GraphicCategoryLabel {
  label?: string | null;
}

export interface GraphicCategory {
  category?: GraphicCategoryLabel[] | null;
}

export interface DataValue {
  value?: string | null;
}

export interface DatasetValue {
  seriesname?: string | null;
  showValues?: string | null;
  parentYAxis?: string | null;
  renderas?: string | null;
  label?: string | null;
  color?: string | null;
  data?: DataValue[] | null;
}

export interface GraphicMulti {
  categories?: GraphicCategory[] | null;
  chart?: GraphicChart;
  dataset?: DatasetValue[] | null;
}

export interface GetCostsAndMeasuresRequest {
  contractID?: number;
  dateFrom?: DateInput;
  dateTo?: DateInput;
  sumMethod?: SumMethod;
  costRender?: string | null;
  consumeRender?: string | null;
  costShow?: boolean;
  consumeShow?: boolean;
  contractIDs?: number[] | null;
}

export interface ListRevenuesRequest {
  precision: Precision;
  dateFrom: DateInput;
  dateTo: DateInput;
  transactionStatus: TransactionStatus;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class GraphicsModule {
  constructor(private readonly http: HttpCore) {}

  getMeasures(body: GetCostsAndMeasuresRequest) {
    return this.http.post<GraphicMulti>("/Api/v1/Graphics/GetMeasures", body);
  }

  getCosts(body: GetCostsAndMeasuresRequest) {
    return this.http.post<GraphicMulti>("/Api/v1/Graphics/GetCosts", body);
  }

  getCostsAndMeasures(body: GetCostsAndMeasuresRequest) {
    return this.http.post<GraphicMulti>(
      "/Api/v1/Graphics/GetCostsAndMeasures",
      body,
    );
  }

  getGroupedCosts(body: GetCostsAndMeasuresRequest) {
    return this.http.post<GraphicMulti>(
      "/Api/v1/Graphics/GetGroupedCosts",
      body,
    );
  }

  listRevenues(body: ListRevenuesRequest) {
    return this.http.post<GraphicSimple>("/Api/v1/Graphics/ListRevenues", body);
  }
}
