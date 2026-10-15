import type { HttpCore } from "../core";

// ─── DTOs ──────────────────────────────────────────────────────────────────────
export interface GetUserNotificationSettingsRequest {
  customerID: number;
}

export interface UserNotificationContactResponse {
  address?: string | null;
  enabled: boolean;
}

export interface UserNotificationSettingsResponse {
  status: boolean;
  language?: string | null;
  startHour?: string | null;
  endHour?: string | null;
  email?: UserNotificationContactResponse | null;
  sms?: UserNotificationContactResponse | null;
}

export interface UpdateUserNotificationSettingsRequest {
  customerID: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  startHour: string;
  endHour: string;
}

export interface UpdateUserNotificationSettingsResponse {
  status: boolean;
}

// ─── Module ────────────────────────────────────────────────────────────────────
export class NotificationsModule {
  constructor(private readonly http: HttpCore) {}

  getSettings(body: GetUserNotificationSettingsRequest) {
    return this.http.post<UserNotificationSettingsResponse>(
      "/Api/v1/UserNotificationSettings/Get",
      body,
    );
  }

  updateSettings(body: UpdateUserNotificationSettingsRequest) {
    return this.http.post<UpdateUserNotificationSettingsResponse>(
      "/Api/v1/UserNotificationSettings/Update",
      body,
    );
  }
}
