import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

const clientId = "dc15bb2f-0add-4175-a6ff-2fa359c939d2";
const tenantId = "a1140869-f59a-4a86-a143-a6a507266816";

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: "/admin/callback",
  },
  cache: {
    cacheLocation: "sessionStorage" as const,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean
      ) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
        else if (level === LogLevel.Warning) console.warn(message);
      },
    },
  },
};

export const loginRequest = {
  scopes: [`api://${clientId}/Admin`],
};

export const msalInstance = new PublicClientApplication(msalConfig);
