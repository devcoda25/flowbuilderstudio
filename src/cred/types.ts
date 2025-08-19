export type CredentialType = 'bearer' | 'basic' | 'apiKey';

export type CredentialSummary = {
  id: string;
  name: string;
  type: CredentialType;
  createdAt: number;
  updatedAt: number;
  rotatedAt?: number;
  // non-secret config (apiKey only)
  apiKeyName?: string;
  apiKeyIn?: 'header' | 'query';
};

export type BearerSecret = { token: string };
export type BasicSecret  = { username: string; password: string };
export type ApiKeySecret = { key: string };

export type SecretByType<T extends CredentialType> =
  T extends 'bearer' ? BearerSecret :
  T extends 'basic'  ? BasicSecret  :
  T extends 'apiKey' ? ApiKeySecret : never;

export type VaultRecord =
  (CredentialSummary & { enc: string }); // enc = base64(iv+ciphertext)
